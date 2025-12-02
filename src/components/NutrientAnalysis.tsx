import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { TrendingDown, Sparkles } from "lucide-react";

interface NutrientAnalysisProps {
  profile: any;
}

// Simulated nutrient analysis (In production, this would use AI/API)
const analyzeNutrients = (meals: any[]) => {
  // This is a simplified simulation
  const mealCount = meals.length;
  
  // Simulate nutrient percentages based on meal variety
  const basePercentage = Math.min(100, (mealCount / 21) * 100);
  
  return {
    iron: Math.max(20, Math.min(100, basePercentage + Math.random() * 20)),
    calcium: Math.max(20, Math.min(100, basePercentage + Math.random() * 20)),
    potassium: Math.max(20, Math.min(100, basePercentage + Math.random() * 20)),
    magnesium: Math.max(20, Math.min(100, basePercentage + Math.random() * 20)),
  };
};

const getRecommendations = (nutrients: any, medicalConditions: string[]) => {
  const recommendations: string[] = [];
  const lowestNutrient = Object.entries(nutrients).reduce((a, b) =>
    (a[1] as number) < (b[1] as number) ? a : b
  );

  const isDiabetic = medicalConditions.includes("diabetes");
  const hasHypertension = medicalConditions.includes("hypertension");
  const hasCholesterol = medicalConditions.includes("cholesterol");

  // Recommendations based on lowest nutrient
  switch (lowestNutrient[0]) {
    case "iron":
      recommendations.push(
        isDiabetic
          ? "Add spinach, lentils, and chickpeas to your meals (avoid high sugar fruits)"
          : "Increase intake of red meat, spinach, lentils, and fortified cereals"
      );
      break;
    case "calcium":
      recommendations.push(
        hasHypertension
          ? "Include low-fat dairy, tofu, and leafy greens (watch sodium content)"
          : "Add dairy products, fortified plant milk, and calcium-rich greens"
      );
      break;
    case "potassium":
      recommendations.push(
        hasCholesterol
          ? "Eat more bananas, sweet potatoes, and avocados (heart-healthy options)"
          : "Include bananas, potatoes, beans, and fish in your diet"
      );
      break;
    case "magnesium":
      recommendations.push(
        isDiabetic
          ? "Add almonds, pumpkin seeds, and whole grains (portion controlled)"
          : "Consume more nuts, seeds, whole grains, and dark chocolate"
      );
      break;
  }

  // Condition-specific recommendations
  if (isDiabetic) {
    recommendations.push("Focus on complex carbohydrates and avoid refined sugars");
    recommendations.push("Include fiber-rich foods to help manage blood sugar");
  }

  if (hasHypertension) {
    recommendations.push("Reduce sodium intake and increase potassium-rich foods");
    recommendations.push("Choose fresh foods over processed options");
  }

  if (hasCholesterol) {
    recommendations.push("Include omega-3 fatty acids from fish and nuts");
    recommendations.push("Avoid trans fats and limit saturated fats");
  }

  return recommendations;
};

const NutrientAnalysis = ({ profile }: NutrientAnalysisProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weeklyMeals, setWeeklyMeals] = useState<any[]>([]);
  const { toast } = useToast();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    loadWeeklyMeals();
  }, []);

  const loadWeeklyMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("meal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("meal_date", format(weekStart, "yyyy-MM-dd"))
        .lte("meal_date", format(weekEnd, "yyyy-MM-dd"));

      if (error) throw error;

      setWeeklyMeals(data || []);
    } catch (error: any) {
      console.error("Error loading meals:", error);
    }
  };

  const handleAnalyze = async () => {
    if (weeklyMeals.length === 0) {
      toast({
        title: "No Data",
        description: "Please enter meals for this week before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const nutrients = analyzeNutrients(weeklyMeals);
      const recommendations = getRecommendations(nutrients, profile.medical_conditions);

      const analysisData = {
        nutrients,
        recommendations,
        weekStart: format(weekStart, "yyyy-MM-dd"),
        weekEnd: format(weekEnd, "yyyy-MM-dd"),
      };

      setAnalysis(analysisData);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("weekly_reports").insert({
          user_id: user.id,
          week_start: format(weekStart, "yyyy-MM-dd"),
          week_end: format(weekEnd, "yyyy-MM-dd"),
          iron_percentage: nutrients.iron,
          calcium_percentage: nutrients.calcium,
          potassium_percentage: nutrients.potassium,
          magnesium_percentage: nutrients.magnesium,
          recommendations: recommendations,
        });
      }

      toast({
        title: "Analysis Complete!",
        description: "Your weekly nutrition report is ready.",
      });
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

  const nutrients = [
    { name: "Iron", key: "iron", color: "bg-red-500" },
    { name: "Calcium", key: "calcium", color: "bg-blue-500" },
    { name: "Potassium", key: "potassium", color: "bg-yellow-500" },
    { name: "Magnesium", key: "magnesium", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-medical-green/20 shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Nutrient Analysis</CardTitle>
          <CardDescription>
            Analyze your nutrition intake for {format(weekStart, "MMM d")} -{" "}
            {format(weekEnd, "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAnalyze}
            disabled={loading || weeklyMeals.length === 0}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing..." : "Generate Analysis"}
          </Button>

          {weeklyMeals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Add at least one meal to generate analysis
            </p>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card className="border-medical-green/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Nutrient Levels
              </CardTitle>
              <CardDescription>Percentage of recommended daily intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {nutrients.map(({ name, key, color }) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(analysis.nutrients[key])}%
                    </span>
                  </div>
                  <Progress value={analysis.nutrients[key]} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-medical-green/20 shadow-lg">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Based on your nutrient analysis and medical conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 bg-medical-green-light rounded-lg"
                  >
                    <span className="text-primary font-bold">{index + 1}.</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NutrientAnalysis;
