import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataItem } from '../types';

import DashboardCard from './DashboardCard';

interface CustomLineChartProps {
    data: ChartDataItem[];
    title: string;
    lineColor?: string;
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({ data, title, lineColor = '#3B82F6' }) => {
  return (
    <DashboardCard title={title}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
          <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip
              cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }}
              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#E5E7EB' }}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={{ r: 4, fill: lineColor }} activeDot={{ r: 6 }} name="Value"/>
        </LineChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default CustomLineChart;
