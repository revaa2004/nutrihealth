import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Coffee, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface MealInputProps {
  profile: any;
}

const MEAL_TYPES = [
  { type: "breakfast", label: "Breakfast", icon: Coffee },
  { type: "lunch", label: "Lunch", icon: Sun },
  { type: "dinner", label: "Dinner", icon: Moon },
];

const MealInput = ({ profile }: MealInputProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<{ [key: string]: string }>({});
  const [savedMeals, setSavedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  const loadMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("meal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("meal_date", dateStr);

      if (error) throw error;

      setSavedMeals(data || []);
      
      const mealsObj: { [key: string]: string } = {};
      data?.forEach((meal) => {
        mealsObj[meal.meal_type] = meal.meal_description;
      });
      setMeals(mealsObj);
    } catch (error: any) {
      console.error("Error loading meals:", error);
    }
  };

  const handleSaveMeal = async (mealType: string) => {
    if (!meals[mealType]?.trim()) {
      toast({
        title: "Empty Meal",
        description: "Please enter meal details before saving.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Check if meal already exists
      const existingMeal = savedMeals.find((m) => m.meal_type === mealType);

      if (existingMeal) {
        const { error } = await supabase
          .from("meal_entries")
          .update({ meal_description: meals[mealType] })
          .eq("id", existingMeal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("meal_entries").insert({
          user_id: user.id,
          meal_type: mealType,
          meal_description: meals[mealType],
          meal_date: dateStr,
        });

        if (error) throw error;
      }

      toast({
        title: "Meal Saved!",
        description: `Your ${mealType} has been recorded.`,
      });

      loadMeals();
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

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card className="border-medical-green/20 shadow-lg">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose a day to enter or view meals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">
              Week of {format(weekStart, "MMM d, yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <Button
                key={day.toISOString()}
                variant={isSameDay(day, selectedDate) ? "default" : "outline"}
                className="flex flex-col h-auto py-2"
                onClick={() => setSelectedDate(day)}
              >
                <span className="text-xs">{format(day, "EEE")}</span>
                <span className="text-lg font-bold">{format(day, "d")}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meal Inputs */}
      {MEAL_TYPES.map(({ type, label, icon: Icon }) => {
        const savedMeal = savedMeals.find((m) => m.meal_type === type);
        
        return (
          <Card key={type} className="border-medical-green/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>
                    {format(selectedDate, "MMMM d, yyyy")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${type}-input`}>What did you eat?</Label>
                <Textarea
                  id={`${type}-input`}
                  placeholder={`Describe your ${label.toLowerCase()}...`}
                  value={meals[type] || ""}
                  onChange={(e) =>
                    setMeals({ ...meals, [type]: e.target.value })
                  }
                  rows={4}
                  className="border-medical-green/30 focus:border-primary"
                />
              </div>

              {savedMeal && (
                <div className="p-3 bg-medical-green-light rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Previously saved:</p>
                  <p className="text-sm">{savedMeal.meal_description}</p>
                </div>
              )}

              <Button
                onClick={() => handleSaveMeal(type)}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Saving..." : savedMeal ? "Update" : "Save"} {label}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MealInput;
