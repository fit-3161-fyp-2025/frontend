import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  Clock,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { publicEventApi } from "./api/publicEvents";
import type { Event } from "./types/events";
import { PublicRSVPDialog } from "./components/event-calendar/public-rsvp-dialog";
import type { CalendarEvent } from "./components/event-calendar/types";
import { format } from "date-fns";
import { ModeToggle } from "./components/mode-toggle";

export function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await publicEventApi.getAll();
        // Get next 3 upcoming events
        const upcomingEvents = response.events
          .filter((event) => new Date(event.start) > new Date())
          .sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
          )
          .slice(0, 3);
        setFeaturedEvents(upcomingEvents);
      } catch (error) {
        console.error("Failed to fetch featured events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const handleEventClick = (event: Event) => {
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.name,
      description: event.description,
      start: new Date(event.start),
      end: new Date(event.end),
      color: event.colour,
      location: event.location,
    };
    setSelectedEvent(calendarEvent);
    setIsRSVPDialogOpen(true);
  };

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
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Stay Connected with
            <span className="text-primary block">Your Clubs</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover events, manage teams, and stay organized with ClubSync.
            Whether you're a member or just curious, we've got you covered.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/public/events">
                <CalendarDays className="mr-2 h-5 w-5" />
                View Public Events
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link to="/signup">
                <Users className="mr-2 h-5 w-5" />
                Join Clubs
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CalendarDays className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Public Events</CardTitle>
              <CardDescription>
                Browse all upcoming events without needing an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay informed about club events, workshops, and meetings. View
                dates, times, and locations at a glance.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Easy RSVP</CardTitle>
              <CardDescription>
                Get event invitations sent directly to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click on any event to request an RSVP invitation. Accept or
                decline right from your email.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Join teams to access exclusive features and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create an account to join teams, manage projects, and
                collaborate with your clubs.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Events Section */}
        {!loadingEvents && featuredEvents.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Upcoming Events
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't miss out on these exciting upcoming events.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => handleEventClick(event)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>
                          {format(new Date(event.start), "PPP 'at' p")}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Request Invitation</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/public/events">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Public Events Preview Section */}
        <div className="bg-card rounded-lg border p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Ready to Explore?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            No registration required! Jump right in and see what's happening in
            your clubs. You can always create an account later to unlock
            additional features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/public/events">
                <Clock className="mr-2 h-4 w-4" />
                Browse Events Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Already have an account?</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 FIT3161/FIT3162 Projects</p>
        </div>
      </footer>

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
