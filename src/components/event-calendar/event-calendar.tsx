"use client"

import { useEffect, useMemo, useState } from "react"
import { RiCalendarCheckLine } from "@remixicon/react"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import {
  CalendarDays,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CalendarEvent, CalendarView } from "./types"
import { addHoursToDate } from "./utils"
import { AgendaDaysToShow, EventGap, EventHeight, WeekCellsHeight } from "./constants"
import { AgendaView } from "./agenda-view"
import { CalendarDndProvider } from "./calendar-dnd-context"
import { DayView } from "./day-view"
import { EventDialog } from "./event-dialog"
import { MonthView } from "./month-view"
import { PublicRSVPDialog } from "./public-rsvp-dialog"
import { PublicSignupDialog } from "./public-signup-dialog"
import { DayEventsPopup } from "./day-events-popup"
import { WeekView } from "./week-view"

export interface EventCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  className?: string
  initialView?: CalendarView
  publicMode?: boolean
  isExec?: boolean | null
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
  publicMode = false,
  isExec,
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>(initialView)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isPublicRSVPDialogOpen, setIsPublicRSVPDialogOpen] = useState(false)
  const [isPublicSignupDialogOpen, setIsPublicSignupDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDayEventsPopupOpen, setIsDayEventsPopupOpen] = useState(false)
  const [dayEventsDate, setDayEventsDate] = useState<Date | null>(null)

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month")
          break
        case "w":
          setView("week")
          break
        case "d":
          setView("day")
          break
        case "a":
          setView("agenda")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEventDialogOpen])

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setCurrentDate(addDays(currentDate, -AgendaDaysToShow))
    }
  }

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setCurrentDate(addDays(currentDate, AgendaDaysToShow))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventSelect = (event: CalendarEvent) => {
    console.log("Event selected:", event) // Debug log
    setSelectedEvent(event)
    if (publicMode) {
      setIsPublicRSVPDialogOpen(true)
    } else if (isExec) {
      setIsEventDialogOpen(true)
    }
  }

  const handleEventCreate = (startTime: Date) => {
    console.log("Creating new event at:", startTime) // Debug log

    if (!isExec) return;

    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes()
    const remainder = minutes % 15
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder)
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder))
      }
      startTime.setSeconds(0)
      startTime.setMilliseconds(0)
    }

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: startTime,
      end: addHoursToDate(startTime, 1),
      allDay: false,
    }
    setSelectedEvent(newEvent)
    setIsEventDialogOpen(true)
  }

  const handlePublicEventCreate = (startTime: Date) => {
    console.log("Public user clicked on date:", startTime) // Debug log
    setSelectedDate(startTime)
    setIsPublicSignupDialogOpen(true)
  }

  const handleDayClick = (date: Date, hasEvents: boolean) => {
    if (hasEvents) {
      setDayEventsDate(date)
      setIsDayEventsPopupOpen(true)
    } else {
      // Handle empty day click as before
      const startTime = new Date(date)
      startTime.setHours(9, 0, 0, 0) // Default to 9 AM
      if (publicMode) {
        handlePublicEventCreate(startTime)
      } else {
        handleEventCreate(startTime)
      }
    }
  }

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event)
      // Show toast notification when an event is updated
      toast(`Event "${event.title}" updated`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      })
    } else {
      onEventAdd?.({
        ...event,
        id: Math.random().toString(36).substring(2, 11),
      })
      // Show toast notification when an event is added
      toast(`Event "${event.title}" added`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      })
    }
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId)
    onEventDelete?.(eventId)
    setIsEventDialogOpen(false)
    setSelectedEvent(null)

    // Show toast notification when an event is deleted
    if (deletedEvent) {
      toast(`Event "${deletedEvent.title}" deleted`, {
        description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
        position: "bottom-left",
      })
    }
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent)

    // Show toast notification when an event is updated via drag and drop
    toast(`Event "${updatedEvent.title}" moved`, {
      description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
      position: "bottom-left",
    })
  }

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy")
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy")
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
      }
    } else if (view === "day") {
      return (
        <>
          <span className="min-[480px]:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      )
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate
      const end = addDays(currentDate, AgendaDaysToShow - 1)

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy")
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
      }
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }, [currentDate, view])

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1",
        publicMode && "shadow-lg border-primary/20 bg-gradient-to-b from-background to-muted/10"
      )}
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div
          className={cn(
            "flex items-center justify-between p-2 sm:p-4",
            publicMode && "bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg border-b",
            className
          )}
        >
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              variant="outline"
              className={cn(
                "max-[479px]:aspect-square max-[479px]:p-0!",
                publicMode && "bg-primary/10 hover:bg-primary/20 border-primary/30"
              )}
              onClick={handleToday}
            >
              <RiCalendarCheckLine
                className="min-[480px]:hidden"
                size={16}
                aria-hidden="true"
              />
              <span className="max-[479px]:sr-only">Today</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(publicMode && "hover:bg-primary/10")}
                onClick={handlePrevious}
                aria-label="Previous"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(publicMode && "hover:bg-primary/10")}
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
                {viewTitle}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "gap-1.5 max-[479px]:h-8",
                    publicMode && "bg-background/80 hover:bg-background/90"
                  )}
                >
                  <span>
                    <span className="min-[480px]:hidden" aria-hidden="true">
                      {view.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-[479px]:sr-only">
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="-me-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => setView("month")}>
                  Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("week")}>
                  Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("day")}>
                  Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("agenda")}>
                  Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!publicMode && isExec && (
              <Button
                className="max-[479px]:aspect-square max-[479px]:p-0!"
                size="sm"
                onClick={() => {
                  setSelectedEvent(null) // Ensure we're creating a new event
                  setIsEventDialogOpen(true)
                }}
              >
                <PlusIcon
                  className="opacity-60 sm:-ms-1"
                  size={16}
                  aria-hidden="true"
                />
                <span className="max-sm:sr-only">New event</span>
              </Button>
            )}
          </div>
        </div>

        <div className={cn(
          "flex flex-1 flex-col",
          publicMode && "bg-gradient-to-b from-transparent to-muted/5"
        )}>
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={publicMode ? handlePublicEventCreate : handleEventCreate}
              onDayClick={handleDayClick}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={publicMode ? handlePublicEventCreate : handleEventCreate}
              onDayClick={handleDayClick}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={publicMode ? handlePublicEventCreate : handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}

          {publicMode && events.length === 0 && (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Events Yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Check back soon for exciting events, or create an account to start organizing your own!
                </p>
              </div>
            </div>
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false)
            setSelectedEvent(null)
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />

        <PublicRSVPDialog
          event={selectedEvent}
          isOpen={isPublicRSVPDialogOpen}
          onClose={() => {
            setIsPublicRSVPDialogOpen(false)
            setSelectedEvent(null)
          }}
        />

        <PublicSignupDialog
          selectedDate={selectedDate}
          isOpen={isPublicSignupDialogOpen}
          onClose={() => {
            setIsPublicSignupDialogOpen(false)
            setSelectedDate(null)
          }}
        />

        <DayEventsPopup
          date={dayEventsDate}
          events={events}
          isOpen={isDayEventsPopupOpen}
          onClose={() => {
            setIsDayEventsPopupOpen(false)
            setDayEventsDate(null)
          }}
          onEventSelect={handleEventSelect}
          publicMode={publicMode}
        />
      </CalendarDndProvider>
    </div>
  )
}
