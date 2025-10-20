
'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function DashboardHeader() {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-headline font-bold tracking-tight">
                Dashboard
            </h1>
            <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground hidden md:block">Showing:</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-48 justify-between">
                            This Month
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                        <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>This Week</DropdownMenuItem>
                        <DropdownMenuItem>Last Week</DropdownMenuItem>
                        <DropdownMenuItem>This Month</DropdownMenuItem>
                        <DropdownMenuItem>Last Month</DropdownMenuItem>
                        <DropdownMenuItem>Custom Range</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
      </div>
    )
}
