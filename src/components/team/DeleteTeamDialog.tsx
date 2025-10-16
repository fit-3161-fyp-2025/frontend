import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { teamApi } from "@/api/team";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import type { TeamModel } from "@/types/team";

export interface DeleteTeamDialogProps {
  team: TeamModel;
  onDelete: () => void;
  execMemberIds?: string[];
  memberDetails?: Array<{ id: string; email: string }>;
}

export function DeleteTeamDialog({
  team,
  onDelete,
  execMemberIds,
  memberDetails,
}: DeleteTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { push } = useToast();

  // Use the execMemberIds from props (fetched from API) or fall back to team.exec_member_ids
  const executiveMembers = execMemberIds || team.exec_member_ids || [];

  // Find the current user's ID by matching their email with member details
  const currentUserMember = memberDetails?.find(
    (member) => member.email === user?.email
  );
  const currentUserId = currentUserMember?.id;

  // Check if current user is an executive
  const isExecutive = currentUserId && executiveMembers.includes(currentUserId);

  const handleDelete = async () => {
    if (!isExecutive) {
      push({
        title: "Permission Denied",
        description: "Only executives can delete teams",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await teamApi.deleteTeam(team.id);
      push({
        title: "Team Deleted",
        description: `${team.name} has been permanently deleted`,
        variant: "default",
      });
      setIsOpen(false);
      onDelete();
    } catch (error) {
      console.error("Error deleting team:", error);
      push({
        title: "Error Deleting Team",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Don't render anything if user is not an executive
  if (!isExecutive) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Team</DialogTitle>
        <DialogDescription>
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold">{team.name}</span>?
        </DialogDescription>
        <div className="space-y-2">
          <p className="text-red-600 font-semibold">
            ⚠️ This action cannot be undone. All team data, projects, and events
            will be permanently deleted.
          </p>
          {!isExecutive && (
            <p className="text-red-600 font-semibold">
              Only executives can delete teams.
            </p>
          )}
          {!user && (
            <p className="text-orange-600 font-semibold">
              ⚠️ User authentication not loaded. Please refresh the page.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !isExecutive}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Permanently Delete Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
