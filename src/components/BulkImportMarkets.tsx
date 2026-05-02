import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CSVRow {
  name: string;
  category: string;
  address_chinese: string;
  working_hours: string;
  description?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  markets?: { id: string; name: string; latitude: number | null; longitude: number | null }[];
  error?: string;
}

export const BulkImportMarkets = ({ onImportComplete }: { onImportComplete?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    // Skip header row
    const dataRows = lines.slice(1);
    const markets: CSVRow[] = [];

    for (const line of dataRows) {
      // Handle quoted CSV values
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Last value

      // Map columns according to user specification
      // Column 0: № (skip)
      // Column 1: Bozor nomi/市场名称 -> name
      // Column 2: Qanday bozor/市场类型 -> category
      // Column 3: Lokatsiyasi/定位 -> description
      // Column 4: Manzili/地址 -> address_chinese
      // Column 5: Ish vaqti/上班时间 -> working_hours
      if (values.length >= 5 && values[1]) {
        markets.push({
          name: values[1].replace(/"/g, "").trim(),
          category: values[2]?.replace(/"/g, "").trim() || "General",
          address_chinese: values[4]?.replace(/"/g, "").trim() || "",
          working_hours: values[5]?.replace(/"/g, "").trim() || "",
          description: values[3]?.replace(/"/g, "").trim() || undefined,
        });
      }
    }

    return markets;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setResult(null);
      toast.success(`Parsed ${parsed.length} markets from CSV`);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast.error("No data to import");
      return;
    }

    setImporting(true);
    setProgress(10);
    setStatus("Preparing data...");
    setResult(null);

    try {
      setProgress(20);
      setStatus("Geocoding addresses & translating (this may take a few minutes)...");

      const { data, error } = await supabase.functions.invoke("bulk-import-markets", {
        body: { markets: csvData },
      });

      if (error) throw error;

      setProgress(100);
      setStatus("Import complete!");
      setResult(data as ImportResult);

      if (data?.success) {
        toast.success(`Successfully imported ${data.imported} markets!`);
        onImportComplete?.();
      } else {
        toast.error(data?.error || "Import failed");
      }
    } catch (error: unknown) {
      console.error("Import error:", error);
      const message = error instanceof Error ? error.message : "Import failed";
      setResult({ success: false, imported: 0, error: message });
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setCsvData([]);
    setResult(null);
    setProgress(0);
    setStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Markets</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple markets at once. Addresses will be geocoded and names translated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to select CSV file
              </p>
            </label>
          </div>

          {/* Preview */}
          {csvData.length > 0 && !result && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Ready to import {csvData.length} markets:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {csvData.slice(0, 5).map((row, i) => (
                  <div key={i} className="text-xs text-muted-foreground truncate">
                    {i + 1}. {row.name} ({row.category})
                  </div>
                ))}
                {csvData.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    ...and {csvData.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {status}
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 ${result.success ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <p className={`font-medium ${result.success ? 'text-primary' : 'text-destructive'}`}>
                  {result.success ? `Imported ${result.imported} markets` : 'Import failed'}
                </p>
              </div>
              {result.error && (
                <p className="text-sm text-destructive">{result.error}</p>
              )}
              {result.markets && result.markets.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  {result.markets.filter(m => m.latitude).length} markets geocoded successfully
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || csvData.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {csvData.length > 0 ? csvData.length : ''} Markets
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
