import type { EventColor } from "@/components/event-calendar";
import type { RSVP } from "@/components/event-calendar/types";

export interface Event {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  colour: EventColor;
  location: string;
  rsvp_ids: string[];
  public: boolean;
}

export interface GetAllEventsRes {
  events: Event[];
}

export interface CreateEventPayload {
  name: string;
  description: string;
  start: string;
  end: string;
  colour: EventColor;
  location: string;
}

export interface CreateEventRes {
  event: Event;
}

export interface DeleteEventPayload {
  event_id: string;
}

export interface GetRSVPResponse {
  rsvps: RSVP[];
}

export interface InviteRSVPResponse {
  rsvp_id: string;
}
