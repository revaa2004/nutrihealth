import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart, Upload, Sparkles, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-nutrition.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

const features = [
  {
    icon: Upload,
    title: "Upload Reports",
    description: "Easily upload medical reports and lab results for personalized analysis",
    link: "/upload-reports",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get intelligent dietary recommendations based on your health data",
    link: "/ai-insights",
  },
  {
    icon: Calendar,
    title: "Meal Tracking",
    description: "Track your daily meals and monitor nutritional intake throughout the week",
    link: "/meal-tracking",
  },
  {
    icon: TrendingUp,
    title: "Nutrient Analysis",
    description: "Identify deficiencies and get actionable recommendations",
    link: "/nutrient-analysis",
  },
];


  const benefits = [
    "Personalized diet plans based on medical conditions",
    "Weekly nutrition tracking and analysis",
    "Smart food recommendations",
    "Track diabetes, hypertension, and cholesterol",
    "Easy-to-use dashboard interface",
    "Secure and private health data",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-green-light via-background to-medical-blue-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">NutriHealth</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button onClick={() => navigate("/auth")} className="hidden md:inline-flex">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Your Personal{" "}
              <span className="text-primary">Nutrition</span> Assistant
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your health with AI-powered nutrition analysis. Get personalized diet
              recommendations based on your medical conditions and daily meal intake.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                <Heart className="h-5 w-5" />
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl"></div>
            <img
              src={heroImage}
              alt="Healthy nutrition foods"
              className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to manage your nutrition and health in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
        <Link
              key={index}
              to={`/feature/${index}`}   // you can change this route later
              className="block"
            >
          <Card className="border-medical-green/20 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
           <CardContent className="p-6 space-y-4">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
             <feature.icon className="h-6 w-6 text-primary" />
             </div>
             <h3 className="text-xl font-semibold">{feature.title}</h3>
             <p className="text-muted-foreground text-sm">{feature.description}</p>
           </CardContent>
         </Card>
        </Link>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-medical-green/20 shadow-2xl">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Choose NutriHealth?
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-12 text-center space-y-6">
                <Heart className="h-20 w-20 text-primary mx-auto" />
                <h3 className="text-2xl font-bold">Start Today</h3>
                <p className="text-muted-foreground">
                  Join thousands of users improving their health with personalized nutrition
                </p>
                <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-medical-green/20 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 NutriHealth. Your health, our priority.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
