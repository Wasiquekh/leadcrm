// app/component/AppCalendar.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

export default function AppCalendar() {
  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={[
          {
            id: "1",
            title: "Demo Event",
            start: new Date().toISOString().slice(0, 10),
          },
        ]}
        dateClick={(arg: DateClickArg) => alert(`Clicked ${arg.dateStr}`)}
        eventClick={(arg: EventClickArg) => alert(`Event: ${arg.event.title}`)}
        height="auto"
      />
    </div>
  );
}
