import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import type { EventModel } from "@/types/team";
// import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";

interface UpcomingEventsProps {
  events: EventModel[];
  isLoading?: boolean;
}

export function UpcomingEvents({ events, isLoading = false }: UpcomingEventsProps) {
  const navigate = useNavigate();

  // Sort events by start date, get next 3 upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Loading upcoming events...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Upcoming Events</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/events")}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {upcomingEvents.length > 0 
            ? `${upcomingEvents.length} events coming up` 
            : "No upcoming events"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate("/events")}
            >
              View Calendar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate("/events")}
              >
                <div className="space-y-3">
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{event.name}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1" 
                      style={{ backgroundColor: event.colour }}
                    />
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatEventTime(event.start)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {/* RSVP Status */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {event.rsvp_ids.length} RSVPs
                        </span>
                      </div>
                      
                      <Badge 
                        variant={event.public ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {event.public ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Button */}
            {events.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/events")}
              >
                View All Events ({events.length - 3} more)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
