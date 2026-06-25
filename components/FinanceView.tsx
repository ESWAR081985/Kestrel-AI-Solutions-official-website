import React, { useState } from 'react';
import { FinanceTransaction } from '../types';
import Table from './Table';
import { FinanceTrendChart } from './FinanceTrendChart';
import { useCurrency, SUPPORTED_CURRENCIES } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Globe, ChevronDown, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface FinanceViewProps {
    financeData: FinanceTransaction[];
    onUpdateFinance?: (financeData: FinanceTransaction[]) => void;
}

interface FinanceFormState {
    id?: string;
    date: string;
    description: string;
    amount: number;
    type: 'revenue' | 'expense';
}

const FinanceView: React.FC<FinanceViewProps> = ({ financeData, onUpdateFinance }) => {
    const { formatAmount, activeCurrency, setCurrencyByCode } = useCurrency();
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [localCurrencyOpen, setLocalCurrencyOpen] = React.useState(false);
    const localCurrencyRef = React.useRef<HTMLDivElement>(null);

    // CMS Modals and form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formState, setFormState] = useState<FinanceFormState>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        type: 'revenue'
    });

    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (localCurrencyRef.current && !localCurrencyRef.current.contains(e.target as Node)) {
                setLocalCurrencyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Dynamic Calculated KPI states directly compiled from the actual list to keep data perfectly synchronized
    const calculatedIncome = React.useMemo(() => {
        const base = 10000000; // base offset for mock compatibility
        let added = 0;
        financeData.forEach(tx => {
            if (tx.type === 'revenue') {
                added += Math.abs(tx.amount);
            }
        });
        return base + added;
    }, [financeData]);

    const calculatedExpenses = React.useMemo(() => {
        const base = 5980000; // base offset for mock compatibility
        let added = 0;
        financeData.forEach(tx => {
            if (tx.type === 'expense') {
                added += Math.abs(tx.amount);
            }
        });
        return base + added;
    }, [financeData]);

    const calculatedNetProfit = React.useMemo(() => {
        return calculatedIncome - calculatedExpenses;
    }, [calculatedIncome, calculatedExpenses]);

    // Dynamic Monthly Revenue Data Aggregation of baseline and dynamic user actions
    const monthlyRevenueData = React.useMemo(() => {
        const baselineMonths = [
            { key: '2025-12', name: 'Dec 25', baseline: 1850000 },
            { key: '2026-01', name: 'Jan 26', baseline: 1920000 },
            { key: '2026-02', name: 'Feb 26', baseline: 2000000 },
            { key: '2026-03', name: 'Mar 26', baseline: 2150000 },
            { key: '2026-04', name: 'Apr 26', baseline: 2280000 },
            { key: '2026-05', name: 'May 26', baseline: 2300000 },
        ];

        return baselineMonths.map(m => {
            let userAddedRevenue = 0;
            financeData.forEach(tx => {
                if (tx.type === 'revenue' && tx.date && tx.date.startsWith(m.key)) {
                    userAddedRevenue += Math.abs(tx.amount);
                }
            });
            return {
                month: m.name,
                revenue: m.baseline + userAddedRevenue,
            };
        });
    }, [financeData]);

    // Dynamic Revenue Distribution by division / service category
    const revenueDistributionData = React.useMemo(() => {
        const distribution = [
            { name: 'Custom Software Dev', value: 5500000, color: '#10B981' },
            { name: 'Generative AI & LLMs', value: 3200000, color: '#06B6D4' },
            { name: 'ML Engineering', value: 2505000, color: '#3B82F6' },
            { name: 'Cloud & Web Solutions', value: 1300000, color: '#6366F1' },
        ];

        financeData.forEach(tx => {
            if (tx.type === 'revenue') {
                const desc = tx.description.toLowerCase();
                const amt = Math.abs(tx.amount);
                if (desc.includes('freight') || desc.includes('software') || desc.includes('custom')) {
                    distribution[0].value += amt;
                } else if (desc.includes('chat') || desc.includes('gen') || desc.includes('llm') || desc.includes('gpt')) {
                    distribution[1].value += amt;
                } else if (desc.includes('machine') || desc.includes('learning') || desc.includes('ml') || desc.includes('analytics')) {
                    distribution[2].value += amt;
                } else {
                    distribution[3].value += amt;
                }
            }
        });

        return distribution;
    }, [financeData]);

    const formatRupee = (value: number) => {
        return formatAmount(value, 'short');
    };

    // CMS CRUD Actions
    const openAddModal = () => {
        setFormState({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: 100000,
            type: 'revenue'
        });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (item: FinanceTransaction) => {
        setFormState({
            id: item.id,
            date: item.date,
            description: item.description,
            amount: Math.abs(item.amount),
            type: item.amount >= 0 ? 'revenue' : 'expense'
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteTransaction = (id: string) => {
        if (!onUpdateFinance) return;
        if (confirm('Are you sure you want to permanently delete this financial transaction?')) {
            const updated = financeData.filter(tx => tx.id !== id);
            onUpdateFinance(updated);
        }
    };

    const handleSaveTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onUpdateFinance) return;

        const rawAmount = Number(formState.amount);
        if (isNaN(rawAmount) || rawAmount <= 0) {
            alert('Please enter a valid positive amount.');
            return;
        }

        const signedAmount = formState.type === 'revenue' ? rawAmount : -rawAmount;

        if (modalMode === 'add') {
            const newTx: FinanceTransaction = {
                id: 'txn_' + Date.now(),
                date: formState.date,
                description: formState.description,
                amount: signedAmount,
                type: formState.type
            };
            onUpdateFinance([newTx, ...financeData]);
        } else {
            const updated = financeData.map(tx => {
                if (tx.id === formState.id) {
                    return {
                        ...tx,
                        date: formState.date,
                        description: formState.description,
                        amount: signedAmount,
                        type: formState.type
                    };
                }
                return tx;
            });
            onUpdateFinance(updated);
        }

        setIsModalOpen(false);
    };

    // Columns structure with dynamic Admin row action injection
    const tableColumns = [
        { header: 'Date', accessor: 'date' as keyof FinanceTransaction },
        { header: 'Description', accessor: 'description' as keyof FinanceTransaction },
        { 
            header: 'Amount', 
            accessor: (item: FinanceTransaction) => (
                <span className={item.amount >= 0 ? 'text-green-600 font-semibold text-xs' : 'text-red-500 font-semibold text-xs'}>
                    {item.amount >= 0 ? '+' : ''} {formatAmount(item.amount, 'full')}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: () => (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Completed
                </span>
            )
        }
    ];

    if (isAdmin) {
        tableColumns.push({
            header: 'Actions',
            accessor: (item: FinanceTransaction) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditModal(item)}
                        className="p-1 px-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Edit Transaction"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => handleDeleteTransaction(item.id)}
                        className="p-1 px-2 text-xs font-bold text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Delete Transaction"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                    </button>
                </div>
            )
        });
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 pb-8 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Financial Overview</h2>
                    <p className="text-slate-500 mt-2">Transparency, accountability, and dynamic real-time exchange rates across multiple world currencies.</p>
                </div>
                
                {/* Local Currency Selector with Intl.NumberFormat */}
                <div className="relative self-start md:self-center" ref={localCurrencyRef}>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                        Base Currency Selector
                    </label>
                    <button
                        onClick={() => setLocalCurrencyOpen(!localCurrencyOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-sm font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        aria-haspopup="true"
                        aria-expanded={localCurrencyOpen}
                    >
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{activeCurrency.code} ({activeCurrency.symbol})</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                    </button>
                    {localCurrencyOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 focus:outline-none">
                            {SUPPORTED_CURRENCIES.map((cur) => (
                                <button
                                    key={cur.code}
                                    onClick={() => {
                                        setCurrencyByCode(cur.code);
                                        setLocalCurrencyOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 font-medium ${cur.code === activeCurrency.code ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                                >
                                    <span>{cur.label}</span>
                                    <span className="font-bold opacity-80">{cur.symbol}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-green-600 font-extrabold text-2xl shrink-0">
                        {activeCurrency.symbol}
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Income</p>
                        <p className="text-2xl font-bold text-slate-800">{formatAmount(calculatedIncome, 'short')}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 font-extrabold text-2xl shrink-0">
                        {activeCurrency.symbol}
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Expenses</p>
                        <p className="text-2xl font-bold text-slate-800">{formatAmount(calculatedExpenses, 'short')}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-indigo-600 font-extrabold text-2xl shrink-0">
                        {activeCurrency.symbol}
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Net Profit</p>
                        <p className="text-2xl font-bold text-slate-800">{formatAmount(calculatedNetProfit, 'short')}</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
                                Monthly Revenue Trend
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Aggregate rolling product and custom dev sales representation</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400">Past 6 Months</span>
                    </div>
                    <div className="h-64 mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <YAxis tickFormatter={formatRupee} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <Tooltip 
                                    formatter={(val: any) => [formatAmount(Number(val || 0), 'full'), 'Revenue']} 
                                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Division Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                <PieIcon className="w-5 h-5 text-indigo-500 mr-2" />
                                Revenue by Division
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Operational sector analysis of dynamic pipelines</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
                        <div className="sm:col-span-6 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={revenueDistributionData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                                        {revenueDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatAmount(Number(value || 0), 'full')} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="sm:col-span-6 space-y-3.5">
                            {revenueDistributionData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-32 sm:max-w-40">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500">{formatAmount(item.value, 'short')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Trend Line Chart */}
            <FinanceTrendChart financeData={financeData} />

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
                        {isAdmin && (
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-kestrel-blue text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-600 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Transaction</span>
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                const headers = ['Date', 'Description', 'Amount', 'Type', 'Status'];
                                const csvRows = [
                                    headers.join(','),
                                    ...financeData.map(item => [
                                        item.date,
                                        `"${item.description.replace(/"/g, '""')}"`,
                                        item.amount,
                                        item.type,
                                        'Completed'
                                    ].join(','))
                                ];
                                const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="inline-flex items-center text-xs font-bold text-indigo-600 border border-indigo-100 hover:bg-indigo-50 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            Download Report
                        </button>
                    </div>
                </div>
                <Table 
                    data={financeData} 
                    columns={tableColumns}
                />
            </div>

            {/* CMS Add / Edit Finance Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
                        <div className="bg-kestrel-blue text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                {modalMode === 'add' ? 'Add Financial Record' : 'Edit Financial Record'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="text-white/85 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-sans">Transaction Date</label>
                                <input
                                    type="date"
                                    value={formState.date}
                                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue font-sans"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-sans">Transaction Description</label>
                                <input
                                    type="text"
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                    placeholder="Enter transaction purpose"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-sans">Base Amount (₹ / USD)</label>
                                    <input
                                        type="number"
                                        value={formState.amount}
                                        onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue font-mono"
                                        required
                                        min="1"
                                        placeholder="Amount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-sans">Flow Type</label>
                                    <select
                                        value={formState.type}
                                        onChange={(e) => setFormState({ ...formState, type: e.target.value as any })}
                                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue font-sans"
                                    >
                                        <option value="revenue">Revenue (+)</option>
                                        <option value="expense">Expense (-)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{modalMode === 'add' ? 'Confirm Record' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceView;
