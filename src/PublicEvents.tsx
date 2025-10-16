import { EventCalendar, type CalendarEvent } from "./components/event-calendar";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { publicEventApi } from "./api/publicEvents";
import { PublicRSVPDialog } from "./components/event-calendar/public-rsvp-dialog";
import {
  CalendarDays,
  ArrowLeft,
  Users,
  Mail,
  Sparkles,
  Clock,
  MapPin,
  UserPlus,
} from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

export function PublicEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await publicEventApi.getAll();
        setEvents(
          fetchedEvents.events.map((event) => {
            return {
              id: event.id,
              title: event.name,
              description: event.description,
              start: new Date(event.start),
              end: new Date(event.end),
              color: event.colour,
              location: event.location,
            };
          })
        );
      } catch (error) {
        console.error("Failed to fetch public events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventBadge = (event: CalendarEvent) => {
    const eventDate = new Date(event.start);
    if (isToday(eventDate))
      return { text: "Today", variant: "destructive" as const };
    if (isTomorrow(eventDate))
      return { text: "Tomorrow", variant: "default" as const };
    if (isThisWeek(eventDate))
      return { text: "This Week", variant: "secondary" as const };
    return null;
  };

  const upcomingEvents = events
    .filter((event) => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsRSVPDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            Loading amazing events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/clubsync.png"
              alt="ClubSync logo"
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-2xl font-bold">ClubSync</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/signup">
                <UserPlus className="mr-2 h-4 w-4" />
                Join ClubSync
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Discover Events
            </h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore exciting events happening in your community. Click any event
            to request an invitation!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Easy RSVP via email</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>
                {
                  events.filter((event) => new Date(event.start) > new Date())
                    .length
                }{" "}
                upcoming events
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Coming Up Soon
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {upcomingEvents.map((event) => {
                const badge = getEventBadge(event);
                return (
                  <Card
                    key={event.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {event.title}
                          </CardTitle>
                          {badge && (
                            <Badge variant={badge.variant} className="mt-2">
                              {badge.text}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>
                            {format(
                              new Date(event.start),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                        )}
                        {event.description && (
                          <p className="line-clamp-2 mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Section */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Event Calendar
          </h2>
          <p className="text-muted-foreground mb-6">
            Browse all events in calendar view.
          </p>

          <EventCalendar
            events={events}
            onEventAdd={undefined}
            onEventUpdate={undefined}
            onEventDelete={undefined}
            publicMode={true}
          />
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-2">Love What You See?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join ClubSync to create your own events, manage teams, and unlock
              powerful collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PublicRSVPDialog
        event={selectedEvent}
        isOpen={isRSVPDialogOpen}
        onClose={() => {
          setIsRSVPDialogOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
