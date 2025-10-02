import { EventCalendar, type CalendarEvent } from "./components/event-calendar";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { publicEventApi } from "./api/publicEvents";

export function PublicEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await publicEventApi.getAll();
        setEvents(
          fetchedEvents.events.map(event => {
            return ({
              id: event.id,
              title: event.name,
              description: event.description,
              start: new Date(event.start),
              end: new Date(event.end),
              color: event.colour,
              location: event.location,
            })
          })
        );
      } catch (error) {
        console.error("Failed to fetch public events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Public Events</h1>
          <p className="text-lg text-muted-foreground">
            View upcoming events and key dates. No registration required.
          </p>
        </div>

        <EventCalendar
          events={events}
          // No event modification for public users
          onEventAdd={undefined}
          onEventUpdate={undefined}
          onEventDelete={undefined}
          publicMode={true}
        />
      </div>
    </div>
  );
}
