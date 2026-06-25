
import React from 'react';
import { DashboardCardProps } from '../types';

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change, icon, children, className = '', titleClassName = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium text-slate-500 ${titleClassName}`}>{title}</h3>
        {icon && <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>}
      </div>
      {value && <div className="text-2xl font-bold text-slate-800">{value}</div>}
      {change && (
        <div className={`text-xs mt-1 font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </div>
      )}
      {children}
    </div>
  );
};

export default DashboardCard;