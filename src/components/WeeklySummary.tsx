import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { Calendar } from "lucide-react";

const WeeklySummary = () => {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("meal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("meal_date", format(weekStart, "yyyy-MM-dd"))
        .lte("meal_date", format(weekEnd, "yyyy-MM-dd"))
        .order("meal_date", { ascending: true });

      if (error) throw error;

      setWeeklyData(data || []);
    } catch (error: any) {
      console.error("Error loading weekly data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-medical-green/20 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading weekly summary...</p>
        </CardContent>
      </Card>
    );
  }

  const groupedByDate = weeklyData.reduce((acc: any, meal: any) => {
    const date = meal.meal_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="border-medical-green/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Weekly Summary</CardTitle>
              <CardDescription>
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByDate).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No meal entries for this week yet. Start tracking your meals!
            </p>
          ) : (
            <div className="space-y-6">
              {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayMeals = groupedByDate[dateStr] || [];

                return (
                  <div key={dateStr} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold mb-2">
                      {format(day, "EEEE, MMM d")}
                    </h3>
                    {dayMeals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No meals recorded</p>
                    ) : (
                      <div className="space-y-2">
                        {dayMeals.map((meal: any) => (
                          <div
                            key={meal.id}
                            className="p-3 bg-medical-green-light rounded-lg"
                          >
                            <p className="text-sm font-medium capitalize mb-1">
                              {meal.meal_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {meal.meal_description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySummary;
