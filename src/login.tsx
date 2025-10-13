import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "./lib/store";
import { fetchTeams } from "./features/teams/teamSlice";
import { CalendarDays, ArrowLeft, Home } from "lucide-react";

const logInFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LogIn() {
  const { login, isLoading, isAuthenticated, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof logInFormSchema>>({
    resolver: zodResolver(logInFormSchema),
  });

  // Log out on mount
  useEffect(() => {
    logout();
  }, []);

  async function onSubmit(values: z.infer<typeof logInFormSchema>) {
    setError(null);

    try {
      await login(values.email, values.password);
      const teams = await dispatch(fetchTeams()).unwrap();

      // If user has teams, navigate to dashboard, otherwise prompt user to
      // create/join a team.
      teams.length === 0 ? navigate("/teams/join") : navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ClubSync</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            {isAuthenticated && (
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="johndoe@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder="(Minimum 6 characters)"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
