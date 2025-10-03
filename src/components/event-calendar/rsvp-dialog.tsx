import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { CalendarEvent } from "./types"
import { publicEventApi } from "@/api/publicEvents"

interface RSVPDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

export function RSVPDialog({ event, isOpen, onClose }: RSVPDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!event || !email.trim()) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      await publicEventApi.sendRSVP(event.id, email.trim())
      toast.success("RSVP invitation sent! Check your email to confirm your attendance.")
      setEmail("")
      onClose()
    } catch (error) {
      console.error("Failed to send RSVP:", error)
      toast.error("Failed to send RSVP invitation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    onClose()
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RSVP to Event</DialogTitle>
          <DialogDescription>
            Get an invitation to this event sent to your email
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Event Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            <div className="text-sm space-y-1">
              <p><strong>Start:</strong> {format(event.start, "PPP 'at' p")}</p>
              <p><strong>End:</strong> {format(event.end, "PPP 'at' p")}</p>
              {event.location && (
                <p><strong>Location:</strong> {event.location}</p>
              )}
            </div>
          </div>

          {/* Email Input */}
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
              />
              <p className="text-xs text-muted-foreground">
                You'll receive an email with accept/decline links
              </p>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send RSVP Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
