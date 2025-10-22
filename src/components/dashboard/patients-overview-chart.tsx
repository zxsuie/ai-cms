
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { getPatientOverview } from '@/app/(app)/dashboard/actions';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

type OverviewData = {
  name: string;
  value: number;
  fill: string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="p-2 bg-background border rounded-md shadow-lg text-sm">
        <p className="font-bold">{`${label}`}</p>
        <p>{`Visits: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};


export function PatientsOverviewChart() {
  const [data, setData] = React.useState<OverviewData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { theme: mode } = useTheme();

  const fetchOverview = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPatientOverview();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "An unexpected error occurred.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);
  
  // Resolve theme to a non-undefined value. Default to 'dark' if system theme is not yet resolved.
  const resolvedTheme = mode === "system" ? "dark" : mode || "dark";

  const [mutedForegroundColor, borderColor, backgroundColor, accentColor] = React.useMemo(() => {
      if (typeof window === 'undefined') {
        return ["#000000", "#eeeeee", "#ffffff", "#FFA500"];
      }
      const style = getComputedStyle(document.body);
      const mutedForeground = style.getPropertyValue('--muted-foreground');
      const border = style.getPropertyValue('--border');
      const background = style.getPropertyValue('--background');
      const accent = style.getPropertyValue('--accent');

      return [
        `hsl(${mutedForeground})`,
        `hsl(${border})`,
        `hsl(${background})`,
        `hsl(${accent})`
      ];
  }, [resolvedTheme]);


  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }
  
  if (error) {
    return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Data Fetch Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  const chartData = data.filter(d => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground text-center">
        <p>No patient data available to display.</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={borderColor} />
          <XAxis 
            type="number" 
            stroke={mutedForegroundColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke={mutedForegroundColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip 
            cursor={{ fill: accentColor, opacity: 0.5 }}
            content={<CustomTooltip />}
             contentStyle={{ 
                backgroundColor: backgroundColor,
                borderColor: borderColor,
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
