import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Travel from "./pages/Travel";
import Ibadah from "./pages/Ibadah";
import Business from "./pages/Business";
import Profile from "./pages/Profile";
import Cargo from "./pages/Cargo";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              <Route path="/discover" element={<Home />} />
              <Route path="/saved" element={<Rewards />} />
              <Route path="/mosques" element={<Ibadah />} />
              <Route path="/eco" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
