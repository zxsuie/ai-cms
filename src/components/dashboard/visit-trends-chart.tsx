
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
    
    const theme = useMemo(() => 
        themes.find((t) => t.name === (mode === 'dark' ? 'dark' : 'light'))
    , [mode]);

    const chartData = useMemo(() => {
        if (!data) return [];
        return Object.entries(data).map(([day, count]) => ({
            name: day.substring(0, 3),
            total: count,
        }));
    }, [data]);
    
    if (loading || !theme) {
        return <Skeleton className="h-[350px] w-full" />
    }
    
    const themeColors = mode === 'dark' ? theme.cssVars.dark : theme.cssVars.light;
    const primaryColor = `hsl(${themeColors.primary})`;
    const mutedForegroundColor = `hsl(${themeColors["muted-foreground"]})`;
    const backgroundColor = `hsl(${themeColors.background})`;
    const borderColor = `hsl(${themeColors.border})`;


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
