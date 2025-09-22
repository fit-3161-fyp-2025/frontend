import type { TeamModel } from "@/types/team";
// Removed Card, CardContent imports
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";

export interface LeaveTeamDialogProps {
  team: TeamModel,
  onLeave: (teamId: string) => Promise<void>;
}

export function LeaveTeamDialog({ team, onLeave }: LeaveTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeave = async () => {
    setError(null);

    try {
      await onLeave(team.id);
      setIsOpen(false);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Error leaving group, try again";
      setError(errMsg);
      console.error(error);
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTrigger asChild>
          <Button variant="destructive">Leave</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Once you leave you will need to join the team again. Are you sure you
            want to leave <span className="font-semibold">{team.name}</span>?
          </DialogDescription>
          {error && (
            <DialogDescription
              className="font-semibold text-red-500"
            >{error}</DialogDescription>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLeave}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
