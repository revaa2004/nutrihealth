import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Heart, Calendar, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MealInput from "@/components/MealInput";
import WeeklySummary from "@/components/WeeklySummary";
import NutrientAnalysis from "@/components/NutrientAnalysis";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"input" | "summary" | "analysis">("input");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        navigate("/profile-setup");
        return;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-green-light via-background to-medical-blue-light">
      {/* Header */}
      <header className="border-b border-medical-green/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">NutriHealth</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Info Card */}
        <Card className="mb-6 border-medical-green/20 shadow-lg">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Medical conditions and personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="text-lg font-semibold">{profile?.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="text-lg font-semibold capitalize">{profile?.gender}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Medical Conditions</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile?.medical_conditions.map((condition: string) => (
                    <span
                      key={condition}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeView === "input" ? "default" : "outline"}
            onClick={() => setActiveView("input")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Daily Input
          </Button>
          <Button
            variant={activeView === "summary" ? "default" : "outline"}
            onClick={() => setActiveView("summary")}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Weekly Summary
          </Button>
          <Button
            variant={activeView === "analysis" ? "default" : "outline"}
            onClick={() => setActiveView("analysis")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Nutrient Analysis
          </Button>
        </div>

        {/* Content Area */}
        {activeView === "input" && <MealInput profile={profile} />}
        {activeView === "summary" && <WeeklySummary />}
        {activeView === "analysis" && <NutrientAnalysis profile={profile} />}
      </main>
    </div>
  );
};

export default Dashboard;
