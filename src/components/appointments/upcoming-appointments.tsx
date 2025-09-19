import { db } from "@/lib/db";
import { Appointment } from "@/lib/types";

export async function UpcomingAppointments() {
  const appointments = await db.getAppointments();

  if (appointments.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>;
  }

  return (
    <div className="space-y-4">
      {appointments.slice(0, 5).map((appt: Appointment) => (
        <div key={appt.id} className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold">{appt.studentName}</p>
          <p className="text-sm text-muted-foreground">{appt.reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(appt.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      ))}
    </div>
  );
}
