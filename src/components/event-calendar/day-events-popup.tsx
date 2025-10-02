"use client"

import React from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventItem } from "./event-item"
import { getAllEventsForDay, sortEvents } from "./utils"
import type { CalendarEvent } from "./types"

interface DayEventsPopupProps {
  date: Date | null
  events: CalendarEvent[]
  isOpen: boolean
  onClose: () => void
  onEventSelect: (event: CalendarEvent) => void
  publicMode?: boolean
}

export function DayEventsPopup({
  date,
  events,
  isOpen,
  onClose,
  onEventSelect,
  publicMode = false,
}: DayEventsPopupProps) {
  if (!date) return null

  const dayEvents = getAllEventsForDay(events, date)
  const sortedEvents = sortEvents(dayEvents)

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Events on {format(date, "EEEE, MMMM d")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-auto">
          {sortedEvents.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center text-sm">
              No events on this day
            </div>
          ) : (
            <div className="space-y-2">
              {publicMode && (
                <p className="text-sm text-muted-foreground mb-4">
                  Click any event to request an invitation
                </p>
              )}
              {sortedEvents.map((event) => {
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)
                const isFirstDay = eventStart.toDateString() === date.toDateString()
                const isLastDay = eventEnd.toDateString() === date.toDateString()

                return (
                  <div
                    key={event.id}
                    className="cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors"
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <EventItem
                      event={event}
                      view="agenda"
                      isFirstDay={isFirstDay}
                      isLastDay={isLastDay}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
