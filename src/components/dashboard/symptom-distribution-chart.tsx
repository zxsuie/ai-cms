
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, PieLabelRenderProps } from 'recharts';
import { useVisitsLast7Days } from '@/hooks/use-visits-last-7-days';
import { useTheme } from 'next-themes';
import { themes } from '@/themes';

const COLORS = ['#3F51B5', '#FF9800', '#4CAF50', '#F44336', '#9C27B0'];

const RADIAN = Math.PI / 180;
const MAX_LABEL_LENGTH = 20;

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  let displayName = name;
  if (name.length > MAX_LABEL_LENGTH) {
    displayName = `${name.substring(0, MAX_LABEL_LENGTH)}...`;
  }
  
  const labelText = `${displayName}: ${(percent * 100).toFixed(0)}%`;
  
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {labelText}
    </text>
  );
};


export function SymptomDistributionChart() {
  const { symptomCounts } = useVisitsLast7Days();
  const { theme: mode } = useTheme();
  const theme = themes.find((t) => t.name === (mode === 'dark' ? 'dark' : 'light'));

  const data = React.useMemo(() => {
    return Object.entries(symptomCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Take top 5
  }, [symptomCounts]);

  if (!theme) return null;
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        No symptom data available.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: theme.cssVars.light.background,
              borderColor: theme.cssVars.light.border,
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
