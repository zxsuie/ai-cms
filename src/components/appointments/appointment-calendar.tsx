'use client';

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function AppointmentCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </div>
  );
}
