import { useState } from "react";
import {
  Mail,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicEventApi } from "@/api/publicEvents";
import type { CalendarEvent } from "./types";

interface PublicRSVPDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicRSVPDialog({
  event,
  isOpen,
  onClose,
}: PublicRSVPDialogProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await publicEventApi.sendRSVP(event.id, email.trim());
      setIsSuccess(true);
      toast.success("RSVP invitation sent to your email!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send RSVP invitation";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {event.title}
          </DialogTitle>
          <DialogDescription>
            Request an RSVP invitation to be sent to your email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {format(event.start, "PPP 'at' p")}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-3">{event.description}</p>
              </div>
            )}
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send you an invitation email with accept/decline links
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !email.trim()}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Invitation Sent!</h3>
              <p className="text-muted-foreground mb-4">
                Check your email for the RSVP invitation. You can accept or
                decline directly from the email.
              </p>
              <Button onClick={handleClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
