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
          fetchedEvents.events.map(event => ({
            id: event.id,
            title: event.name,
            description: event.description,

            // TODO: Replace with real date time
            start: setMinutes(setHours(addDays(new Date(), 2), 9), 0),
            end: setMinutes(setHours(addDays(new Date(), 2), 10), 0),
            color: "rose",
            location: "innovation lab",
          }))
        );
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    }

    fetchEvents();
  }, []);

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event])
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
