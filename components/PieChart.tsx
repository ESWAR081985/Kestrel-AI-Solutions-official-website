import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataItem } from '../types';

import DashboardCard from './DashboardCard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

interface CustomPieChartProps {
  data: ChartDataItem[];
  title: string;
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({ data, title }) => {
  return (
    <DashboardCard title={title}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#E5E7EB' }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Legend iconSize={10} iconType="circle" wrapperStyle={{fontSize: "12px"}}/>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default CustomPieChart;
