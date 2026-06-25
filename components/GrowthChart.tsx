
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GrowthChartData } from '../types';

import DashboardCard from './DashboardCard';

interface GrowthChartProps {
  data: GrowthChartData[];
  title: string;
}

const colors = ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];

const GrowthChart: React.FC<GrowthChartProps> = ({ data, title }) => {
  return (
    <DashboardCard title={title}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip
              cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }}
              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#E5E7EB' }}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
              {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default GrowthChart;