import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, EyeOff, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // SIGN IN
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) throw signInError;

        // ensure we actually have a user
        const user = signInData?.user;
        if (!user) {
          // This can happen if sign in didn't produce a session (rare)
          toast({
            title: "Sign-in issue",
            description:
              "Sign-in did not produce a user session. Please check your credentials or verify your email.",
            variant: "destructive",
          });
          return;
        }

        // Query profile: use maybeSingle so we don't error when row is missing
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          // database error - show message
          toast({
            title: "Error fetching profile",
            description:
              profileError.message || "Could not read your profile information.",
            variant: "destructive",
          });
          // still allow navigation to dashboard or profile-setup depending on your logic
          // here we'll send user to profile-setup to ensure they can complete it
          navigate("/profile-setup");
          return;
        }

        // If profileData exists, go to dashboard, else profile setup
        if (profileData) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Welcome!",
            description: "Please complete your profile setup.",
          });
          navigate("/profile-setup");
        }
      } else {
        // SIGN UP
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile-setup`,
          },
        });

        if (signUpError) throw signUpError;

        // signUpData may contain user/session OR when confirmation required it may be null session
        const signedUpUser = signUpData?.user;
        const session = signUpData?.session;

        // If user is immediately logged in (session available), navigate to profile setup
        if (session && signedUpUser) {
          toast({
            title: "Account created!",
            description: "You are signed in — please complete your profile.",
          });
          navigate("/profile-setup");
        } else {
          // If verification required, instruct user to check email
          toast({
            title: "Check your email",
            description:
              "We sent a confirmation link to your email. Please click the link to continue to profile setup.",
          });
          // Optionally redirect to a page that explains next steps (e.g. /verify-email)
        }
      }
    } catch (err: any) {
      // show supabase error nicely
      toast({
        title: "Authentication error",
        description: err?.message ?? "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-green-light via-background to-medical-blue-light flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-medical-green/20">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access your nutrition dashboard"
              : "Sign up to start your health journey"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-medical-green/30 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-medical-green/30 focus:border-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

