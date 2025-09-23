'use client';

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";

export function AppointmentCalendar() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Set initial date on client-side to avoid hydration mismatch
  useEffect(() => {
    setDate(new Date());
  }, []);


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
