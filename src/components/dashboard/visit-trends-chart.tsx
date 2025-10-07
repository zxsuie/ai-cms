
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useVisitsLast7Days } from "@/hooks/use-visits-last-7-days"
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { themes } from "@/themes";

export function VisitTrendsChart() {
    const { data } = useVisitsLast7Days();
    const { theme: mode } = useTheme();
    const theme = themes.find((t) => t.name === (mode === "dark" ? "dark" : "light"));

    const chartData = useMemo(() => {
        return Object.entries(data).map(([day, count]) => ({
            name: day.substring(0, 3),
            total: count,
        }));
    }, [data]);
    
    if (!theme) return null;

    return (
        <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
            <XAxis
                dataKey="name"
                stroke={theme.cssVars.light["muted-foreground"]}
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke={theme.cssVars.light["muted-foreground"]}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
                cursor={false}
                contentStyle={{ 
                    backgroundColor: theme.cssVars.light.background,
                    borderColor: theme.cssVars.light.border,
                }}
            />
            <Bar dataKey="total" fill={theme.cssVars.light.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    )
}
