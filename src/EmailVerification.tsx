import { useLocation, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { useState, useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "./components/ui/form";
import { Button } from "./components/ui/button";
import { useAuth } from "./contexts/AuthContext";
import { useAppDispatch } from "./hooks/redux";
import { fetchTeams } from "./features/teams/teamSlice";
import { ProgressLoading } from "./components/ProgressLoading";
import { Clock } from "lucide-react";

const OTPFormSchema = z.object({
  verification_code: z.string().min(6, {
    message: "Your one-time code must be at 6 characters",
  }),
});

export function EmailVerification() {
  const { state } = useLocation();
  const { email, password } = state as { email: string; password: string };
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const { verifyEmailAndLogin } = useAuth();
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof OTPFormSchema>>({
    resolver: zodResolver(OTPFormSchema),
    defaultValues: {
      verification_code: "",
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const onSubmit = async (data: z.infer<typeof OTPFormSchema>) => {
    setError(null);
    setIsVerifying(true);

    try {
      await verifyEmailAndLogin(email, password, data.verification_code);
      const teams = await dispatch(fetchTeams()).unwrap();

      teams.length === 0 ? navigate("/teams/join") : navigate("/dashboard");
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to verify, try again";
      setError(errMsg);
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return <ProgressLoading message="Verifying and logging you in..." />;
  }

  return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <Card className="w-full max-w-md relative">
        {/* Countdown Timer - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-muted rounded-md border">
          <Clock
            className={`h-3.5 w-3.5 ${
              timeLeft <= 60
                ? "text-destructive animate-pulse"
                : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-xs font-mono font-semibold ${
              timeLeft <= 60 ? "text-destructive" : "text-foreground"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <CardHeader>
          <CardTitle>Check your emails</CardTitle>
          <CardDescription>
            We've sent you a one time verification code to
            <span className="font-bold"> {email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeLeft === 0 && (
            <div className="text-destructive text-sm mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
              Verification code has expired. Please sign up again to receive a
              new code.
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm mb-4 p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="verification_code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                        disabled={timeLeft === 0 || isVerifying}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Please enter the one-time password sent to your email.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isVerifying || timeLeft === 0}
                  className="flex-1"
                >
                  Verify
                </Button>
                {timeLeft === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/signup")}
                    className="flex-1"
                  >
                    Sign Up Again
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
