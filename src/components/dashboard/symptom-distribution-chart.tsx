
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { useVisitsLast7Days } from '@/hooks/use-visits-last-7-days';
import { useTheme } from 'next-themes';
import { themes } from '@/themes';

const COLORS = ['#3F51B5', '#FF9800', '#4CAF50', '#F44336', '#9C27B0'];

const RADIAN = Math.PI / 180;

// A custom label with lines pointing from the chart to the label
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
  const radius = outerRadius + 15; // Position label outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 10) * cos;
  const my = cy + (outerRadius + 10) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={props.fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={props.fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill={props.fill} fontSize={12}>
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
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
        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <Tooltip
            cursor={{fill: 'transparent'}}
            contentStyle={{
              backgroundColor: `hsl(${theme.cssVars.light.background})`,
              borderColor: `hsl(${theme.cssVars.light.border})`,
            }}
            formatter={(value, name) => [`${value} visits`, name]}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
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
