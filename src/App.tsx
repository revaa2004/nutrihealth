import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import UploadReports from "./pages/UploadReports";
import AIPoweredInsights from "./pages/AIPoweredInsights";
import MealTracking from "./pages/MealTracking";
import NutrientAnalysis from "./pages/NutrientAnalysis";


const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            <Route
              path="/"
              element={!session ? <Index /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/auth"
              element={!session ? <Auth /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/profile-setup"
              element={session ? <ProfileSetup /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/dashboard"
              element={session ? <Dashboard /> : <Navigate to="/auth" replace />}
            />
            <Route path="/upload-reports" element={<UploadReports />} />
            <Route path="/ai-insights" element={<AIPoweredInsights />} />
            <Route path="/meal-tracking" element={<MealTracking />} />
            <Route path="/nutrient-analysis" element={<NutrientAnalysis />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
