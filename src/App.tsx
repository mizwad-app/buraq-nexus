import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { CityProvider } from "@/contexts/CityContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Home from "./pages/Home";
import Travel from "./pages/Travel";
import Ibadah from "./pages/Ibadah";
import Business from "./pages/Business";
import Profile from "./pages/Profile";
import DeepCheckRequest from "./pages/DeepCheckRequest";
import AdminDeepChecks from "./pages/AdminDeepChecks";
import AdminLocations from "./pages/AdminLocations";
import TravelChecklist from "./pages/TravelChecklist";
import Translators from "./pages/Translators";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServiceRequests from "./pages/AdminServiceRequests";
import AdminLegalAdvisors from "./pages/AdminLegalAdvisors";
import AdminPlaces from "./pages/AdminPlaces";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import Consulate from "./pages/Consulate";
import Services from "./pages/Services";
import YoriqnomaPage from "./pages/services/YoriqnomaPage";
import VideoTipsPage from "./pages/services/VideoTipsPage";
import DocumentsPage from "./pages/services/DocumentsPage";
import TicketsPage from "./pages/services/TicketsPage";

const queryClient = new QueryClient();

const App = () => (
<QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
      <CityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OnboardingGate />
            <Routes>
              {/* Admin Routes - Full screen without bottom nav */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="locations" element={<AdminLocations />} />
                <Route path="deep-checks" element={<AdminDeepChecks />} />
                <Route path="service-requests" element={<AdminServiceRequests />} />
                <Route path="legal-advisors" element={<AdminLegalAdvisors />} />
                <Route path="places" element={<AdminPlaces />} />
              </Route>

              {/* Main App Routes - With bottom navigation */}
              <Route
                path="/*"
                element={
                  <div className="min-h-screen w-full max-w-lg mx-auto relative bg-background">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/travel" element={<Travel />} />
                      <Route path="/ibadah" element={<Ibadah />} />
                      <Route path="/business" element={<Business />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/deep-check" element={<DeepCheckRequest />} />
                      <Route path="/checklist" element={<TravelChecklist />} />
                      <Route path="/translators" element={<Translators />} />
                      <Route path="/onboarding" element={<OnboardingFlow />} />
                      <Route path="/consulate" element={<Consulate />} />
                      <Route path="/xizmatlar" element={<Services />} />
                      <Route path="/xizmatlar/yo-riqnoma" element={<YoriqnomaPage />} />
                      <Route path="/xizmatlar/video" element={<VideoTipsPage />} />
                      <Route path="/xizmatlar/hujjatlar" element={<DocumentsPage />} />
                      <Route path="/xizmatlar/biletlar" element={<TicketsPage />} />

                      {/* Backward-compatible redirects */}
                      <Route path="/mosques" element={<Navigate to="/ibadah" replace />} />
                      <Route path="/marketplace" element={<Navigate to="/translators" replace />} />
                      <Route path="/translator-marketplace" element={<Navigate to="/translators" replace />} />
                      <Route path="/guide" element={<Navigate to="/travel?tab=guide" replace />} />
                      <Route path="/services" element={<Navigate to="/profile" replace />} />
                      <Route path="/transport" element={<Navigate to="/" replace />} />
                      <Route path="/cargo" element={<Navigate to="/" replace />} />
                      <Route path="/rewards" element={<Navigate to="/" replace />} />
                      <Route path="/eco" element={<Navigate to="/" replace />} />
                      <Route path="/gifts" element={<Navigate to="/" replace />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <BottomNavigation />
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CityProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
