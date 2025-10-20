
'use client';

import { DashboardGreeting } from "./dashboard-greeting";

export function DashboardHeader() {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <DashboardGreeting />
      </div>
    )
}
