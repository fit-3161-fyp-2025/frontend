import type { TeamModel } from "@/types/team";
// Removed Card, CardContent imports
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import type { User } from "@/types/auth";

export interface ViewTeamDetailsDialogProps {
  team: TeamModel;
  getTeamDetails: (teamId: string) => Promise<{ members: User[]; code: string }>;
}

export function ViewTeamDetailsDialog({ team, getTeamDetails }: ViewTeamDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<{ members: User[]; code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await getTeamDetails(team.id);
      setDetails(res);
    } catch (e) {
      setError("Failed to load team details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleOpen} style={{ marginLeft: 8 }}>View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Team Details</DialogTitle>
        {loading ? (
          <DialogDescription>Loading...</DialogDescription>
        ) : error ? (
          <DialogDescription className="text-red-500">{error}</DialogDescription>
        ) : details ? (
          <>
            <DialogDescription>
              <strong>Short Code:</strong> {details.code}
            </DialogDescription>
            <DialogDescription>
              <strong>Members:</strong>
              <ul>
                {details.members.map((m) => (
                  <li key={m.id}>{m.email}</li>
                ))}
              </ul>
            </DialogDescription>
          </>
        ) : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
