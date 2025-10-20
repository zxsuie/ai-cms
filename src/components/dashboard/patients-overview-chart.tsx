
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { getPatientOverview } from '@/app/(app)/dashboard/actions';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import { themes } from '@/themes';

type OverviewData = {
  name: string;
  value: number;
  fill: string;
};

const CustomTooltip = ({ active, payload, label, data }: any) => {
  if (active && payload && payload.length && data) {
    const totalVisits = data.reduce((acc: number, d: OverviewData) => acc + d.value, 0);
    const percentage = totalVisits > 0 ? ((payload[0].value / totalVisits) * 100).toFixed(1) : 0;
    
    return (
      <div className="p-2 bg-background border rounded-md shadow-lg text-sm">
        <p className="font-bold">{`${label}`}</p>
        <p>{`Visits: ${payload[0].value}`}</p>
        <p>{`Share: ${percentage}%`}</p>
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
  const theme = themes.find((t) => t.name === (mode === 'dark' ? 'dark' : 'light'));

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

  if (!theme) return null;

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
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={`hsl(${theme.cssVars.light.border})`} />
          <XAxis 
            type="number" 
            stroke={`hsl(${theme.cssVars.light["muted-foreground"]})`}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke={`hsl(${theme.cssVars.light["muted-foreground"]})`}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--accent))' }}
            content={<CustomTooltip data={chartData} />}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
