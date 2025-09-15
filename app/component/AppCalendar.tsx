"use client";

import React, { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";

// react-big-calendar
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// date-fns helpers
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  parseISO,
  isValid,
} from "date-fns";
import { enUS } from "date-fns/locale";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Props = { leadId: string; reloadKey?: number; hitApi: boolean };

export interface TaskData {
  id: string;
  assigned_agent_name: string;
  details: string;
  due_at?: string; // ISO UTC (optional if API omits)
  due_at_ist?: string; // "yyyy-MM-dd hh:mm AM/PM"
  status: string;
  timer_hours: number;
  timer_minutes: number;
}

export default function AppCalendar({ leadId, reloadKey = 0, hitApi }: Props) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  console.log("TASK LIST", tasks);
  const [loading, setLoading] = useState(false);

  // Safe date parser: tries due_at (ISO) then due_at_ist
  const toStartDate = (t: TaskData): Date | null => {
    if (t.due_at) {
      const d = parseISO(String(t.due_at));
      if (isValid(d)) return d;
    }
    if (t.due_at_ist) {
      const s = String(t.due_at_ist).trim().toUpperCase(); // e.g., "2025-09-15 12:00 AM"
      // try with and without leading zero for hour
      let d = parse(s, "yyyy-MM-dd hh:mm a", new Date());
      if (isValid(d)) return d;
      d = parse(s, "yyyy-MM-dd h:mm a", new Date());
      if (isValid(d)) return d;
    }
    return null;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await AxiosProvider.post("/leads/tasks/list", {
          lead_id: leadId,
        });
        console.log("TTTTTTTTTTTTTT", res.data.data[0].task);
        // shape: [{ task: {...} }, ...]  OR  [{...taskFields}]
        const rows = res.data.data[0].task;
        const list: TaskData[] = rows
          .map((r: any) => r?.task ?? r)
          .filter(Boolean);
        setTasks(list);
      } catch (e) {
        console.error("Error fetching tasks:", e);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) fetchTasks();
  }, [leadId, reloadKey, hitApi]);

  // Map tasks -> RBC events; skip invalid dates
  const events = tasks
    .map((t) => {
      const start = toStartDate(t);
      if (!start) return null;
      const mins = (t.timer_hours || 0) * 60 + (t.timer_minutes || 0);
      const end = addMinutes(start, mins > 0 ? mins : 30); // default 30m
      return {
        id: t.id,
        title: `${t.details} — ${t.assigned_agent_name} (${t.status})`,
        start,
        end,
        allDay: false,
        resource: t,
      };
    })
    .filter(Boolean) as {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: TaskData;
  }[];

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        defaultView="month"
        style={{ height: "80vh" }}
        onSelectEvent={(event) => {
          const t = (event as any).resource as TaskData;
          alert(
            [
              `Agent: ${t.assigned_agent_name}`,
              `Details: ${t.details}`,
              `Status: ${t.status}`,
              `Due (UTC): ${t.due_at ?? "-"}`,
              `Due (IST): ${t.due_at_ist ?? "-"}`,
              `Timer: ${t.timer_hours}h ${t.timer_minutes}m`,
            ].join("\n")
          );
        }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#2563eb",
            borderColor: "#1e40af",
            color: "#fff",
          },
        })}
      />
      {loading && (
        <div className="mt-2 text-sm text-gray-500">Loading tasks…</div>
      )}
    </div>
  );
}
