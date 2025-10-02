import { Calendar, UserPlus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PublicSignupDialogProps {
  selectedDate: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicSignupDialog({
  selectedDate,
  isOpen,
  onClose,
}: PublicSignupDialogProps) {
  if (!selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            No events scheduled for {format(selectedDate, "MMMM d")}
          </DialogTitle>
          <DialogDescription>
            Create an account to organize events and manage your team's calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium">ClubSync provides comprehensive event management:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Schedule and organize events
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Manage invitations and track attendance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Coordinate team projects and workflows
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Automated notifications and reminders
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Not Now
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
