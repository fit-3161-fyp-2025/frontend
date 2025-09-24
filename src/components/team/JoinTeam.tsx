import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamApi } from "@/api/team";

export interface JoinTeamProps {
  onJoin?: () => void;
  description?: string | null;
}

const joinFormSchema = z.object({
  team_code: z.string().min(1, "Team code is required"),
});

export function JoinTeam({ onJoin, description }: JoinTeamProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
  });

  async function onSubmit(values: z.infer<typeof joinFormSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      await teamApi.joinByShortId(values.team_code);
      onJoin && onJoin();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full max-w-sm max-h-sm">
      <CardHeader>
        <CardTitle>Join Team</CardTitle>
        {description && (
          <CardDescription>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {error && (
              <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="team_code"
              render={({ field }) => (
                <FormItem className="pb-4">
                  <FormLabel>Team Code</FormLabel>
                  <FormControl>
                    <Input id="team_code" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full"
            >
              Join Team
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

  );
}
