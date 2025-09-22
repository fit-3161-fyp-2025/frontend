import type { TeamModel } from "@/types/team";
// Removed Card, CardContent imports
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import type { User } from "@/types/auth";
import { useNavigate } from "react-router";

export interface ViewTeamDetailsDialogProps {
  team: TeamModel;
  getTeamDetails: (teamId: string) => Promise<{ members: User[]; code: string }>;
}

export function ViewTeamDetailsDialog({ team, getTeamDetails }: ViewTeamDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<{ members: User[]; code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await getTeamDetails(team.id);
      setDetails(res);
    } catch (e) {
      let errorMsg = "Failed to load team details.";
      if (e instanceof Error) {
        errorMsg += `\n${e.message}`;
      } else if (typeof e === "string") {
        errorMsg += `\n${e}`;
      }
      setError(errorMsg);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const openFullPage = () => {
    setIsOpen(false);
    navigate(`/teams/${team.id}`);
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
          <DialogDescription className="text-red-500">
            {error}
            <br />
            <span style={{ fontSize: "0.9em", color: "#888" }}>
              Please check if the backend endpoint is working and returning the expected data.<br />
              Team ID: {team.id}
            </span>
          </DialogDescription>
        ) : details ? (
          <>
            <DialogDescription>
              <strong>Short Code:</strong> {details.code || <span style={{color: 'gray'}}>No code available</span>}
            </DialogDescription>
            <DialogDescription>
              <strong>Members:</strong>
              {details.members && details.members.length > 0 ? (
                <ul>
                  {details.members.map((m) => (
                    <li key={m.id}>{m.email}</li>
                  ))}
                </ul>
              ) : (
                <span style={{color: 'gray'}}>No members found</span>
              )}
            </DialogDescription>
          </>
        ) : (
          <DialogDescription>
            <span style={{color: 'gray'}}>No details available for this team.</span>
          </DialogDescription>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={openFullPage}>Open full page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
