
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useVisitsLast7Days } from "@/hooks/use-visits-last-7-days"
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { themes } from "@/themes";
import { Skeleton } from "../ui/skeleton";

export function VisitTrendsChart() {
    const { data, loading } = useVisitsLast7Days();
    const { theme: mode } = useTheme();
    
    const theme = themes.find((t) => t.name === "light"); // Base theme for structure
    const currentTheme = mode === 'dark' ? themes.find(t => t.name === 'dark') : theme;


    const chartData = useMemo(() => {
        return Object.entries(data).map(([day, count]) => ({
            name: day.substring(0, 3),
            total: count,
        }));
    }, [data]);
    
    if (loading || !theme || !currentTheme) {
        return <Skeleton className="h-[350px] w-full" />
    }
    
    const themeColors = currentTheme.cssVars.light; // In our themes.ts, dark vars are also under a 'light' key which is confusing but how it is.

    return (
        <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
            <XAxis
                dataKey="name"
                stroke={themeColors["muted-foreground"]}
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke={themeColors["muted-foreground"]}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
                cursor={false}
                contentStyle={{ 
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                }}
            />
            <Bar dataKey="total" fill={themeColors.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    )
}
