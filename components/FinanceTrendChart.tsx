import React, { useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { FinanceTransaction } from '../types';
import { TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

interface FinanceTrendChartProps {
    financeData: FinanceTransaction[];
}

export const FinanceTrendChart: React.FC<FinanceTrendChartProps> = ({ financeData }) => {
    const [chartMode, setChartMode] = useState<'all' | 'revenue' | 'expense'>('all');
    const { formatAmount } = useCurrency();

    // 1. Establish the baseline for the last 6 months (December 2025 to May 2026)
    // Values matching the ₹1.25Cr Income / ₹79.8L Expenses summary scale.
    const baselineData = [
        { monthKey: '2025-12', monthName: 'Dec 25', baselineIncome: 1850000, baselineExpense: 1120000 },
        { monthKey: '2026-01', monthName: 'Jan 26', baselineIncome: 1920000, baselineExpense: 1250000 },
        { monthKey: '2026-02', monthName: 'Feb 26', baselineIncome: 2000000, baselineExpense: 1300000 },
        { monthKey: '2026-03', monthName: 'Mar 26', baselineIncome: 2150000, baselineExpense: 1420000 },
        { monthKey: '2026-04', monthName: 'Apr 26', baselineIncome: 2280000, baselineExpense: 1410000 },
        { monthKey: '2026-05', monthName: 'May 26', baselineIncome: 2300000, baselineExpense: 1480000 },
    ];

    // 2. Map and aggregate financeData transactions dynamically
    const chartData = baselineData.map(item => {
        let incomeAddition = 0;
        let expenseAddition = 0;

        financeData.forEach(tx => {
            if (tx.date && tx.date.startsWith(item.monthKey)) {
                if (tx.type === 'revenue') {
                    incomeAddition += Math.abs(tx.amount);
                } else if (tx.type === 'expense') {
                    expenseAddition += Math.abs(tx.amount);
                }
            }
        });

        // Sum baseline + dynamic user added transactions
        const finalIncome = item.baselineIncome + incomeAddition;
        const finalExpense = item.baselineExpense + expenseAddition;
        const profit = finalIncome - finalExpense;
        const margin = finalIncome > 0 ? Math.round((profit / finalIncome) * 100) : 0;

        return {
            name: item.monthName,
            Revenue: finalIncome,
            Expenses: finalExpense,
            Profit: profit,
            Margin: margin
        };
    });

    // 3. Calculate metrics for display inside card
    const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + curr.Revenue, 0);
    const totalPeriodExpenses = chartData.reduce((acc, curr) => acc + curr.Expenses, 0);
    const totalPeriodProfit = totalPeriodRevenue - totalPeriodExpenses;
    const avgProfitPercentage = totalPeriodRevenue > 0 ? Math.round((totalPeriodProfit / totalPeriodRevenue) * 100) : 0;

    // Format currency to readable formats
    const formatCurrencyForYAxis = (value: number) => {
        return formatAmount(value, 'chart');
    };

    const formatCurrencyForTooltip = (value: number) => {
        return formatAmount(value, 'full');
    };

    // Custom Rich Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 text-white p-4 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
                    <p className="font-bold text-slate-300 border-b border-white/10 pb-1.5 flex justify-between items-center">
                        <span>{label}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Financials</span>
                    </p>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => {
                            const isRevenue = entry.name === 'Revenue';
                            const isExpense = entry.name === 'Expenses';
                            const color = isRevenue ? '#10B981' : isExpense ? '#f43f5e' : '#1D4ED8';
                            return (
                                <div key={`tooltip-item-${index}`} className="flex justify-between items-center gap-4 py-0.5">
                                    <span className="flex items-center gap-1.5 font-medium text-slate-400">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                                        {entry.name}:
                                    </span>
                                    <span className="font-bold font-mono text-white">
                                        {formatCurrencyForTooltip(entry.value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {payload.length >= 2 && (
                        <div className="border-t border-white/10 pt-1.5 mt-1.5 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-semibold">Net Profit Margin:</span>
                            <span className="font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                                {payload[0].payload.Margin}% Margin
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 flex flex-col space-y-6">
            {/* Legend & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-kestrel-blue" />
                        Income & Expense Core Trends
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">6-month analytical overview tracking corporate revenue, operational expenditure, and performance index.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setChartMode('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            chartMode === 'all'
                                ? 'bg-kestrel-blue text-white shadow-md shadow-blue-900/10'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All Transmissions
                    </button>
                    <button
                        onClick={() => setChartMode('revenue')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            chartMode === 'revenue'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/10'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Revenue Only
                    </button>
                    <button
                        onClick={() => setChartMode('expense')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            chartMode === 'expense'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/10'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Expenditure Only
                    </button>
                </div>
            </div>

            {/* Micro Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Analyzed Revenue</span>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                        {formatCurrencyForTooltip(totalPeriodRevenue)}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Analyzed Expenses</span>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                        {formatCurrencyForTooltip(totalPeriodExpenses)}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Period Profitability</span>
                    <p className="text-sm font-bold text-emerald-600 font-mono flex items-center">
                        <ArrowUpRight className="w-4 h-4 mr-0.5" />
                        {formatCurrencyForTooltip(totalPeriodProfit)}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Profit Index</span>
                    <p className="text-sm font-bold text-kestrel-blue font-mono flex items-center">
                        <Activity className="w-4 h-4 mr-0.5" />
                        {avgProfitPercentage}% Margin
                    </p>
                </div>
            </div>

            {/* Recharts Live Line Chart */}
            <div className="w-full h-72 md:h-80 pl-2 lg:pl-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <filter id="shadow" x="-5%" y="-5%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="8" stdDeviation="5" floodOpacity="0.1" />
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 'medium' }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatCurrencyForYAxis}
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 'medium' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => <span className="text-xs font-semibold text-slate-600 px-1">{value}</span>}
                        />

                        {/* Revenue Line */}
                        {(chartMode === 'all' || chartMode === 'revenue') && (
                            <Line
                                type="monotone"
                                dataKey="Revenue"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: 'white' }}
                                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
                                filter="url(#shadow)"
                            />
                        )}

                        {/* Expenses Line */}
                        {(chartMode === 'all' || chartMode === 'expense') && (
                            <Line
                                type="monotone"
                                dataKey="Expenses"
                                stroke="#F43F5E"
                                strokeWidth={3}
                                dot={{ r: 4, stroke: '#F43F5E', strokeWidth: 2, fill: 'white' }}
                                activeDot={{ r: 6, stroke: '#F43F5E', strokeWidth: 2, fill: '#F43F5E' }}
                                filter="url(#shadow)"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Monthly Financial Breakdown Table */}
            <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        Monthly Analytical Breakdown
                    </h4>
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        6 Months Segment
                    </span>
                </div>
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table id="financial-breakdown-table" className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left">Month</th>
                                <th scope="col" className="px-4 py-3 text-right">Revenue</th>
                                <th scope="col" className="px-4 py-3 text-right">Expenses</th>
                                <th scope="col" className="px-4 py-3 text-right">Net Profit</th>
                                <th scope="col" className="px-4 py-3 text-right">Profit Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {chartData.map((row) => {
                                const isPositive = row.Profit >= 0;
                                return (
                                    <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-left font-bold text-slate-900">{row.name}</td>
                                        <td className="px-4 py-3 text-right font-mono text-emerald-600">
                                            {formatCurrencyForTooltip(row.Revenue)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-rose-500">
                                            {formatCurrencyForTooltip(row.Expenses)}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono font-bold ${isPositive ? 'text-slate-900' : 'text-rose-600'}`}>
                                            {formatCurrencyForTooltip(row.Profit)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                row.Margin >= 40 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                    : row.Margin >= 30 
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                                {row.Margin}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                            <tr>
                                <td className="px-4 py-3 text-left">Total Period</td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-600">
                                    {formatCurrencyForTooltip(totalPeriodRevenue)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-rose-500">
                                    {formatCurrencyForTooltip(totalPeriodExpenses)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-900">
                                    {formatCurrencyForTooltip(totalPeriodProfit)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="inline-flex bg-slate-900 text-white px-2 py-0.5 rounded-full text-[10px]">
                                        {avgProfitPercentage}% Avg
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
