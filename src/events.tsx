import { EventCalendar, type CalendarEvent } from "./components/event-calendar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./lib/store";
import { eventApi } from "./api/events";
import type { RSVP } from "./components/event-calendar/types";

export function Events() {
  const { selectedTeam } = useSelector((state: RootState) => state.teams);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedTeam) return;

      try {
        const fetchedEvents = await eventApi.getAll(selectedTeam.id);

        const eventsWithRSVPs = await Promise.all(
          fetchedEvents.events.map(async (event) => {
            let guests: RSVP[] = [];

            if (event.rsvp_ids && event.rsvp_ids.length > 0) {
              try {
                const rsvpResponse = await eventApi.getRSVPs(event.id);
                guests = rsvpResponse.rsvps.map((rsvp) => ({
                  id: rsvp.id,
                  email: rsvp.email,
                  status: rsvp.status,
                }));
              } catch (error) {
                console.error(
                  `Failed to fetch RSVPs for event ${event.id}:`,
                  error
                );
              }
            }
            return {
              id: event.id,
              title: event.name,
              description: event.description,
              start: new Date(event.start),
              end: new Date(event.end),
              color: event.colour,
              location: event.location,
              rsvp: guests,
            };
          })
        );

        setEvents(eventsWithRSVPs);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [selectedTeam]);

  const handleEventAdd = async (event: CalendarEvent) => {
    if (!selectedTeam) return;

    try {
      const createdEvent = await eventApi.create(selectedTeam.id, {
        name: event.title,
        description: event.description ?? "No description",
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        colour: event.color ?? "rose",
        location: event.location ?? "No location",
      });

      const formattedCreatedEvent: CalendarEvent = {
        id: createdEvent.event.id,
        title: createdEvent.event.name,
        description: createdEvent.event.description,
        start: new Date(createdEvent.event.start),
        end: new Date(createdEvent.event.end),
        color: createdEvent.event.colour,
        location: createdEvent.event.location,
      };

      setEvents([...events, formattedCreatedEvent]);
    } catch (error) {
      console.error("Failed to create event");
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = async (eventId: string) => {
    if (!selectedTeam) return;

    await eventApi.delete(selectedTeam.id, { event_id: eventId });
    setEvents(events.filter((event) => event.id !== eventId));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
