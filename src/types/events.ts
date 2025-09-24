
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
