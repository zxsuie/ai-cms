
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useVisitsLast7Days } from "@/hooks/use-visits-last-7-days"
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";

export function VisitTrendsChart() {
    const { data, loading } = useVisitsLast7Days();
    const { theme: mode } = useTheme();
    
    const chartData = useMemo(() => {
        if (!data) return [];
        return Object.entries(data).map(([day, count]) => ({
            name: day.substring(0, 3),
            total: count,
        }));
    }, [data]);
    
    // Resolve theme to a non-undefined value. Default to 'dark' if system theme is not yet resolved.
    const resolvedTheme = mode === "system" ? "dark" : mode || "dark";

    const [primaryColor, mutedForegroundColor, backgroundColor, borderColor] = useMemo(() => {
        if (typeof window === 'undefined') {
          return ["#000000", "#000000", "#ffffff", "#eeeeee"];
        }
        const style = getComputedStyle(document.body);
        const primary = style.getPropertyValue('--primary');
        const mutedForeground = style.getPropertyValue('--muted-foreground');
        const background = style.getPropertyValue('--background');
        const border = style.getPropertyValue('--border');

        return [
          `hsl(${primary})`,
          `hsl(${mutedForeground})`,
          `hsl(${background})`,
          `hsl(${border})`
        ];
    }, [resolvedTheme]);


    if (loading) {
        return <Skeleton className="h-[350px] w-full" />
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
            <XAxis
                dataKey="name"
                stroke={mutedForegroundColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke={mutedForegroundColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
                cursor={false}
                contentStyle={{ 
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                }}
            />
            <Bar dataKey="total" fill={primaryColor} radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    )
}
