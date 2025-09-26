import { addDays, setHours, setMinutes } from "date-fns";
import { EventCalendar, type CalendarEvent } from "./components/event-calendar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./lib/store";
import { eventApi } from "./api/events";

export function Events() {
  const { selectedTeam } = useSelector((state: RootState) => state.teams);
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedTeam) return;

      try {
        const fetchedEvents = await eventApi.getAll(selectedTeam.id);
        setEvents(
          fetchedEvents.events.map(event => {
            return ({
              id: event.id,
              title: event.name,
              description: event.description,

              // TODO: Replace with real date time
              start: new Date(event.start),
              end: new Date(event.end),
              color: event.colour,
              location: event.location,
            })
          })
        );
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    }

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
        location: "shi ok",
      }

      setEvents([...events, formattedCreatedEvent]);
    } catch (error) {
      console.error("Failed to create event");
    }
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-left mb-8">Events</h1>

      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
