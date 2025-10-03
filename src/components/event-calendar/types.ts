export type CalendarView = "month" | "week" | "day" | "agenda"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: EventColor
  location?: string
  rsvp?: RSVP[];
}

export interface RSVP {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
}

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange"

export interface EventGuest {
  email: string;
  status?: 'pending' | 'accepted' | 'declined';
}
