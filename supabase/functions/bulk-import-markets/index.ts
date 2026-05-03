import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MarketInput {
  name: string;
  category: string;
  address_chinese: string;
  working_hours: string;
  description?: string;
}

interface TranslatedMarket {
  name: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_ar: string;
  category: string;
  category_uz: string;
  category_ru: string;
  category_en: string;
  category_ar: string;
  address_chinese: string;
  working_hours: string;
  description: string | null;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  description_ar: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  city_uz: string;
  city_ru: string;
  city_en: string;
  city_ar: string;
  country: string;
  market_type: string;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; city: string } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=cn`,
      {
        headers: {
          "User-Agent": "Mizwad/1.0 (admin@mizwad.app)",
        },
      }
    );
    
    const data = await response.json();
    if (data && data.length > 0) {
      // Extract city from display_name
      const displayName = data[0].display_name || "";
      let city = "Beijing"; // Default
      
      // Try to extract city from address
      if (displayName.includes("北京") || displayName.toLowerCase().includes("beijing")) {
        city = "Beijing";
      } else if (displayName.includes("上海") || displayName.toLowerCase().includes("shanghai")) {
        city = "Shanghai";
      } else if (displayName.includes("广州") || displayName.toLowerCase().includes("guangzhou")) {
        city = "Guangzhou";
      } else if (displayName.includes("深圳") || displayName.toLowerCase().includes("shenzhen")) {
        city = "Shenzhen";
      }
      
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        city,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error for address:", address, error);
    return null;
  }
}

async function translateWithAI(
  texts: { name: string; category: string; description?: string }[],
  lovableApiKey: string
): Promise<{ name_uz: string; name_ru: string; name_en: string; name_ar: string; category_uz: string; category_ru: string; category_en: string; category_ar: string; description_uz?: string; description_ru?: string; description_en?: string; description_ar?: string }[]> {
  try {
    const prompt = `You are a professional translator. Translate the following Chinese market names, categories, and descriptions into Uzbek (uz), Russian (ru), English (en), and Arabic (ar).

Input (JSON array):
${JSON.stringify(texts, null, 2)}

Respond with a JSON array of objects. Each object should have:
- name_uz, name_ru, name_en, name_ar (translated names)
- category_uz, category_ru, category_en, category_ar (translated categories)
- description_uz, description_ru, description_en, description_ar (translated descriptions if provided, null otherwise)

Keep translations accurate and culturally appropriate. For market-related terms, use common local equivalents.

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("AI translation failed:", await response.text());
      throw new Error("Translation API failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    
    return JSON.parse(cleanContent.trim());
  } catch (error) {
    console.error("Translation error:", error);
    // Return fallback with English transliterations
    return texts.map(t => ({
      name_uz: t.name,
      name_ru: t.name,
      name_en: t.name,
      name_ar: t.name,
      category_uz: t.category,
      category_ru: t.category,
      category_en: t.category,
      category_ar: t.category,
      description_uz: t.description || undefined,
      description_ru: t.description || undefined,
      description_en: t.description || undefined,
      description_ar: t.description || undefined,
    }));
  }
}

// City translations
const cityTranslations: Record<string, { uz: string; ru: string; en: string; ar: string }> = {
  "Beijing": { uz: "Pekin", ru: "Пекин", en: "Beijing", ar: "بكين" },
  "Shanghai": { uz: "Shanxay", ru: "Шанхай", en: "Shanghai", ar: "شانغهاي" },
  "Guangzhou": { uz: "Guanchzhou", ru: "Гуанчжоу", en: "Guangzhou", ar: "قوانغتشو" },
  "Shenzhen": { uz: "Shenchjen", ru: "Шэньчжэнь", en: "Shenzhen", ar: "شنتشن" },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { markets } = await req.json() as { markets: MarketInput[] };

    if (!markets || !Array.isArray(markets) || markets.length === 0) {
      return new Response(
        JSON.stringify({ error: "No markets provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${markets.length} markets for import...`);

    // Step 1: Extract city from address (without geocoding API to save time)
    // We'll use address parsing instead of API calls for Beijing markets
    const geocodedMarkets: (MarketInput & { lat: number | null; lng: number | null; city: string })[] = [];
    
    for (const market of markets) {
      // Detect city from address
      let city = "Beijing"; // Default for these markets
      const addr = market.address_chinese;
      if (addr.includes("北京") || addr.includes("朝阳区") || addr.includes("丰台区") || addr.includes("东城区") || addr.includes("西城区")) {
        city = "Beijing";
      } else if (addr.includes("上海")) {
        city = "Shanghai";
      } else if (addr.includes("广州")) {
        city = "Guangzhou";
      } else if (addr.includes("深圳")) {
        city = "Shenzhen";
      }
      
      // For now, skip geocoding to avoid rate limits - coordinates can be added later via admin UI
      geocodedMarkets.push({
        ...market,
        lat: null,
        lng: null,
        city,
      });
      console.log(`Parsed: ${market.name} -> City: ${city}`);
    }

    // Step 2: Translate all names and categories with AI
    const textsToTranslate = geocodedMarkets.map(m => ({
      name: m.name,
      category: m.category,
      description: m.description,
    }));

    console.log("Translating market data...");
    const translations = await translateWithAI(textsToTranslate, lovableApiKey);

    // Step 3: Prepare final market objects
    const marketsToInsert: TranslatedMarket[] = geocodedMarkets.map((market, index) => {
      const translation = translations[index] || {
        name_uz: market.name,
        name_ru: market.name,
        name_en: market.name,
        name_ar: market.name,
        category_uz: market.category,
        category_ru: market.category,
        category_en: market.category,
        category_ar: market.category,
        description_uz: null,
        description_ru: null,
        description_en: null,
        description_ar: null,
      };

      const cityTrans = cityTranslations[market.city] || cityTranslations["Beijing"];

      return {
        name: market.name,
        name_uz: translation.name_uz,
        name_ru: translation.name_ru,
        name_en: translation.name_en,
        name_ar: translation.name_ar,
        category: market.category,
        category_uz: translation.category_uz,
        category_ru: translation.category_ru,
        category_en: translation.category_en,
        category_ar: translation.category_ar,
        address_chinese: market.address_chinese,
        working_hours: market.working_hours,
        description: market.description || null,
        description_uz: translation.description_uz || null,
        description_ru: translation.description_ru || null,
        description_en: translation.description_en || null,
        description_ar: translation.description_ar || null,
        latitude: market.lat,
        longitude: market.lng,
        city: market.city,
        city_uz: cityTrans.uz,
        city_ru: cityTrans.ru,
        city_en: cityTrans.en,
        city_ar: cityTrans.ar,
        country: "China",
        market_type: "wholesale",
      };
    });

    // Step 4: Insert into database
    const { data, error } = await supabase
      .from("wholesale_markets")
      .insert(marketsToInsert)
      .select("id, name, latitude, longitude");

    if (error) {
      console.error("Database insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully imported ${data?.length || 0} markets`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: data?.length || 0,
        markets: data 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Bulk import error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
