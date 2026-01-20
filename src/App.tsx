import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { CityProvider } from "@/contexts/CityContext";
import Home from "./pages/Home";
import Travel from "./pages/Travel";
import Ibadah from "./pages/Ibadah";
import Business from "./pages/Business";
import Profile from "./pages/Profile";
import Cargo from "./pages/Cargo";
import Rewards from "./pages/Rewards";
import DeepCheckRequest from "./pages/DeepCheckRequest";
import AdminDeepChecks from "./pages/AdminDeepChecks";
import Mosques from "./pages/Mosques";
import Eco from "./pages/Eco";
import TravelGuide from "./pages/TravelGuide";
import TravelChecklist from "./pages/TravelChecklist";
import Translators from "./pages/Translators";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen w-full max-w-lg mx-auto relative bg-background">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/ibadah" element={<Ibadah />} />
                <Route path="/business" element={<Business />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cargo" element={<Cargo />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/deep-check" element={<DeepCheckRequest />} />
                <Route path="/admin/deep-checks" element={<AdminDeepChecks />} />
                <Route path="/mosques" element={<Mosques />} />
                <Route path="/eco" element={<Eco />} />
                <Route path="/guide" element={<TravelGuide />} />
                <Route path="/checklist" element={<TravelChecklist />} />
                <Route path="/translators" element={<Translators />} />
                <Route path="/services" element={<Services />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNavigation />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
