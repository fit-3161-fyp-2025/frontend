import { useEffect, useMemo, useState } from "react";
import {
  RiCalendarLine,
  RiDeleteBinLine,
  RiMailLine,
  RiRefreshLine,
} from "@remixicon/react";
import { format, isBefore } from "date-fns";

import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "@/components/event-calendar/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent, EventColor, RSVP } from "./types";
import { eventApi } from "@/api/events";
import { toast } from "sonner";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(
    `${DefaultStartHour.toString().padStart(2, "0")}:00`
  );
  const [endTime, setEndTime] = useState(
    `${DefaultEndHour.toString().padStart(2, "0")}:00`
  );
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("sky");
  const [guests, setGuests] = useState<RSVP[]>([]);
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [loadingRSVPs, setLoadingRSVPs] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Function to fetch current RSVP data
  const fetchRSVPData = async (eventId: string) => {
    if (!eventId) return;

    setLoadingRSVPs(true);
    try {
      const rsvpResponse = await eventApi.getRSVPs(eventId);

      // Map backend field names to frontend field names
      const mappedRSVPs = (rsvpResponse.rsvps || []).map((rsvp) => ({
        id: rsvp.id,
        email: rsvp.email,
        status: (rsvp as any).rsvp_status || rsvp.status || "pending", // Handle both field names
      }));

      setGuests(mappedRSVPs);
    } catch (error) {
      console.error("Failed to fetch RSVP data:", error);
      // Fallback to event.rsvp if API call fails
      setGuests(event?.rsvp || []);
    } finally {
      setLoadingRSVPs(false);
    }
  };

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start);
      setEndDate(end);
      setStartTime(formatTimeForInput(start));
      setEndTime(formatTimeForInput(end));
      setAllDay(event.allDay || false);
      setLocation(event.location || "");
      setColor((event.color as EventColor) || "sky");

      // Fetch current RSVP data from server instead of using cached data
      if (event.id) {
        fetchRSVPData(event.id);
      } else {
        // For new events, use the local rsvp data
        setGuests(event.rsvp || []);
      }

      setError(null); // Reset error when opening dialog
    } else if (isOpen) {
      // Only reset form when dialog is actually open
      resetForm();
    }
  }, [event, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime(`${DefaultStartHour.toString().padStart(2, "0")}:00`);
    setEndTime(`${DefaultEndHour.toString().padStart(2, "0")}:00`);
    setAllDay(false);
    setLocation("");
    setColor("sky");
    setGuests([]);
    setGuestEmail("");
    setError(null);
  };

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = Math.floor(date.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = StartHour; hour < EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        const value = `${formattedHour}:${formattedMinute}`;
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute);
        const label = format(date, "h:mm a");
        options.push({ value, label });
      }
    }
    return options;
  }, []); // Empty dependency array ensures this only runs once

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddGuest = async () => {
    const email = guestEmail.trim().toLowerCase();

    if (!email) {
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (guests.some((g) => g.email === email)) {
      setError("This guest has already been added");
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = event && (await eventApi.inviteGuest(event.id, email));

      response &&
        setGuests([
          ...guests,
          { id: response.rsvp_id, email, status: "pending" },
        ]);
      setGuestEmail("");
      setError(null);
      toast.success(`Invite sent to ${email}`);
    } catch (error) {
      setError("Failed to send invite. Please try again.");
      toast.error("Failed to send invite");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleGuestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGuest();
    }
  };

  const handleSave = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime
        .split(":")
        .map(Number);
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(
          `Selected time must be between ${StartHour}:00 and ${EndHour}:00`
        );
        return;
      }

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date");
      return;
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)";

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
      rsvp: guests,
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  // Updated color options to match types.ts
  const colorOptions: Array<{
    value: EventColor;
    label: string;
    bgClass: string;
    borderClass: string;
  }> = [
    {
      value: "sky",
      label: "Sky",
      bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
      borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
    },
    {
      value: "amber",
      label: "Amber",
      bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
      borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
    },
    {
      value: "violet",
      label: "Violet",
      bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
      borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
    },
    {
      value: "rose",
      label: "Rose",
      bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
      borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
    },
    {
      value: "emerald",
      label: "Emerald",
      bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
      borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
    },
    {
      value: "orange",
      label: "Orange",
      bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
      borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription className="sr-only">
            {event?.id
              ? "Edit the details of this event"
              : "Add a new event to your calendar"}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 *:not-first:mt-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        // If end date is before the new start date, update it to match the start date
                        if (isBefore(endDate, date)) {
                          setEndDate(date);
                        }
                        setError(null);
                        setStartDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1.5">
                <Label htmlFor="start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 *:not-first:mt-1.5">
              <Label htmlFor="end-date">End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setError(null);
                        setEndDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1.5">
                <Label htmlFor="end-time">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="all-day">All day</Label>
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {event?.id && (
            <div className="*:not-first:mt-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="guest-email">Invite Guests</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchRSVPData(event.id)}
                  disabled={loadingRSVPs}
                  aria-label="Refresh RSVP data"
                >
                  <RiRefreshLine
                    size={14}
                    className={loadingRSVPs ? "animate-spin" : ""}
                  />
                  <span className="ml-1 text-xs">Refresh</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="Enter email address"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  onKeyDown={handleGuestKeyDown}
                  disabled={isSendingInvite}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddGuest}
                  disabled={isSendingInvite}
                  aria-label="Add guest"
                >
                  <RiMailLine size={16} aria-hidden="true" />
                </Button>
              </div>

              {loadingRSVPs ? (
                <div className="mt-3 flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RiRefreshLine size={16} className="animate-spin" />
                    <span>Loading RSVP data...</span>
                  </div>
                </div>
              ) : guests.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {guests.length} {guests.length === 1 ? "guest" : "guests"}{" "}
                      invited
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-600">
                        {guests.filter((g) => g.status === "accepted").length}{" "}
                        accepted
                      </span>
                      <span className="text-red-600">
                        {guests.filter((g) => g.status === "declined").length}{" "}
                        declined
                      </span>
                      <span className="text-yellow-600">
                        {guests.filter((g) => g.status === "pending").length}{" "}
                        pending
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {guests.map((guest) => {
                      const getStatusBadge = (status: string) => {
                        switch (status) {
                          case "accepted":
                            return (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 hover:bg-green-100"
                              >
                                Confirmed
                              </Badge>
                            );
                          case "declined":
                            return (
                              <Badge
                                variant="destructive"
                                className="bg-red-100 text-red-800 hover:bg-red-100"
                              >
                                Declined
                              </Badge>
                            );
                          case "pending":
                            return (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              >
                                Pending
                              </Badge>
                            );
                          default:
                            return <Badge variant="outline">{status}</Badge>;
                        }
                      };

                      return (
                        <div
                          key={guest.email}
                          className="flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <span className="truncate">{guest.email}</span>
                          {getStatusBadge(guest.status)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground text-center py-2">
                  No guests invited yet
                </div>
              )}
            </div>
          )}

          <fieldset className="space-y-4">
            <legend className="text-foreground text-sm leading-none font-medium">
              Etiquette
            </legend>
            <RadioGroup
              className="flex gap-1.5"
              defaultValue={colorOptions[0]?.value}
              value={color}
              onValueChange={(value: EventColor) => setColor(value)}
            >
              {colorOptions.map((colorOption) => (
                <RadioGroupItem
                  key={colorOption.value}
                  id={`color-${colorOption.value}`}
                  value={colorOption.value}
                  aria-label={colorOption.label}
                  className={cn(
                    "size-6 shadow-none",
                    colorOption.bgClass,
                    colorOption.borderClass
                  )}
                />
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              aria-label="Delete event"
            >
              <RiDeleteBinLine size={16} aria-hidden="true" />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
