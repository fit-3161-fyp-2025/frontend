
export interface Event {
  id: string;
  name: string;
  description: string;
  rsvp_ids: string[];
  public: boolean;
}

export interface GetAllEventsRes {
  events: Event[];
}

export interface CreateEventPayload {
  name: string;
  description: string;
}

export interface CreateEventRes {
  event: Event;
}
