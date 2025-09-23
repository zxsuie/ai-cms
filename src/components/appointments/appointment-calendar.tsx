'use client';

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentCalendar() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDate(new Date());
  }, []);

  return (
    <div className="flex justify-center">
      {isClient ? (
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          initialFocus
        />
      ) : (
        <Skeleton className="h-[298px] w-[320px]" />
      )}
    </div>
  );
}
