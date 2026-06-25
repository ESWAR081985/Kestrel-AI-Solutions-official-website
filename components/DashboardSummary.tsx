import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
    Briefcase, 
    Users, 
    Building, 
    User, 
    CheckCircle2, 
    Clock, 
    ArrowUpRight, 
    Sparkles,
    Coins
} from 'lucide-react';
import { Project, Client } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { IndianRupeeIcon } from './Icons';

interface DashboardSummaryProps {
    projects: Project[];
    clients: { business: Client[]; personal: Client[] };
    refreshCounter: number;
    simMode: 'live' | 'boosted';
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
    projects, 
    clients, 
    refreshCounter, 
    simMode 
}) => {
    const { formatAmount, activeCurrency } = useCurrency();

    // 1. Calculations for Total Projects KPI
    const projectsStats = useMemo(() => {
        const total = projects.length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const inProgress = projects.filter(p => p.status === 'In Progress').length;
        const onHold = projects.filter(p => p.status === 'On Hold').length;
        const pending = projects.filter(p => p.status === 'Not Started').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { total, completed, inProgress, onHold, pending, completionRate };
    }, [projects]);

    // 2. Calculations for Active Clients KPI
    const clientsStats = useMemo(() => {
        const businessCount = clients.business?.length || 0;
        const personalCount = clients.personal?.length || 0;
        const total = businessCount + personalCount;
        
        return { total, businessCount, personalCount };
    }, [clients]);

    // 3. Dynamic Monthly Revenue Calculations matching dashboard telemetry
    const monthlyRevenue = useMemo(() => {
        // Base Monthly Revenue in INR (matches baseline in FinanceView around 2.3M INR)
        let base = 2300000 + (refreshCounter ? Math.round(Math.sin(refreshCounter * 1.5) * 85000) : 0);
        if (simMode === 'boosted') {
            base = Math.round(base * 1.25); // +25% boost!
        }
        return base;
    }, [refreshCounter, simMode]);

    // Dynamic Growth Indicators
    const revenueGrowth = useMemo(() => {
        let pct = 8.4 + (refreshCounter ? parseFloat((Math.sin(refreshCounter * 1.9) * 1.2).toFixed(1)) : 0);
        if (simMode === 'boosted') {
            pct += 3.2;
        }
        return parseFloat(pct.toFixed(1));
    }, [refreshCounter, simMode]);

    return (
        <div id="dashboard-executive-summary" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KPI CARD 1: TOTAL PROJECTS */}
            <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl shadow-md border border-slate-150 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[180px] group"
            >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-50 rounded-full opacity-40 blur-lg pointer-events-none transition-all duration-500 group-hover:scale-125" />
                
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-mono">
                            Core Deliverables
                        </span>
                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 tracking-tight">
                            {projectsStats.total}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Total Projects
                        </span>
                    </div>

                    {/* Progress indicators breakdown */}
                    <div className="mt-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-extrabold">
                            <span className="text-slate-450 uppercase tracking-wide">Completion Index</span>
                            <span className="text-indigo-600 font-mono">{projectsStats.completionRate}%</span>
                        </div>
                        
                        {/* Custom visual progress track */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${projectsStats.completionRate}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-indigo-600 h-full rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Completed: <strong className="text-slate-750 font-black">{projectsStats.completed}</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>In Progress: <strong className="text-slate-750 font-black">{projectsStats.inProgress}</strong></span>
                    </span>
                </div>
            </motion.div>

            {/* KPI CARD 2: ACTIVE CLIENTS */}
            <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl shadow-md border border-slate-150 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[180px] group"
            >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-teal-50 rounded-full opacity-40 blur-lg pointer-events-none transition-all duration-500 group-hover:scale-125" />
                
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-mono">
                            Partner Ecosystem
                        </span>
                        <div className="p-2.5 bg-teal-50 border border-teal-100 text-teal-650 rounded-xl transition-all duration-300 group-hover:bg-teal-600 group-hover:text-white">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 tracking-tight">
                            {clientsStats.total}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Active Clients
                        </span>
                    </div>

                    {/* Quick visually balanced breakdown rails */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                <Building className="w-3 h-3 text-indigo-500" />
                                <span>Enterprise</span>
                            </div>
                            <div className="text-sm font-black text-slate-850 mt-0.5">
                                {clientsStats.businessCount}
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                <User className="w-3 h-3 text-teal-500" />
                                <span>Personal</span>
                            </div>
                            <div className="text-sm font-black text-slate-850 mt-0.5">
                                {clientsStats.personalCount}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-slate-450">
                        <span>Deployments mapped globally</span>
                    </span>
                    <span className="text-teal-600 flex items-center gap-0.5 font-black">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>100% Retained</span>
                    </span>
                </div>
            </motion.div>

            {/* KPI CARD 3: MONTHLY REVENUE */}
            <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl shadow-md border border-slate-150 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[180px] group"
            >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-50 rounded-full opacity-40 blur-lg pointer-events-none transition-all duration-500 group-hover:scale-125" />
                
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-mono">
                            Monthly Billing Rate
                        </span>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-650 rounded-xl transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                            {activeCurrency.code === 'INR' ? (
                                <IndianRupeeIcon className="w-5 h-5" />
                            ) : (
                                <Coins className="w-5 h-5" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 tracking-tight">
                            {formatAmount(monthlyRevenue, 'short')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Monthly Revenue
                        </span>
                    </div>

                    {/* Growth rate bubble */}
                    <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                            +{revenueGrowth}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                            Estimated MoM increase
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                        <span>Local Currency:</span>
                        <strong className="text-indigo-650 font-black">{activeCurrency.code}</strong>
                    </span>
                    {simMode === 'boosted' && (
                        <span className="bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded font-black tracking-wide text-[8.5px]">
                            BOOSTED ACTIVE (+25%)
                        </span>
                    )}
                </div>
            </motion.div>

        </div>
    );
};
