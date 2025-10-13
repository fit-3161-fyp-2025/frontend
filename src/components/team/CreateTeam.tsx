import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useAppDispatch } from "@/hooks/redux";
import { teamApi } from "@/api/team";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addTeam } from "@/features/teams/teamSlice";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

export interface CreateTeamProps {
  onCreate?: () => void;
  description?: string;
}

const createFormSchema = z.object({
  name: z.string(),
});

export function CreateTeam({ onCreate, description }: CreateTeamProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
  });

  async function handleCreateTeam(values: z.infer<typeof createFormSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        name: values.name,
      };
      const team = await teamApi.create(payload);
      // TODO: Set team with team response
      // const teams = await dispatch(fetchTeams()).unwrap();
      dispatch(addTeam(team));

      onCreate && onCreate();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create team, please try again");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateTeam)}>
            {error && (
              <div className="text-destructive text-sm mb-4 p-2 bg-destructive/10 rounded">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="pb-4">
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input id="name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={isLoading} type="submit" className="w-full">
              Create Team
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
