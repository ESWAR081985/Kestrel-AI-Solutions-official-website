import React, { useMemo, useState } from 'react';
import GrowthChart from './GrowthChart';
import CustomPieChart from './PieChart';
import CustomLineChart from './LineChart';
import { ClientPlacementMap } from './ClientPlacementMap';
import { IndianRupeeIcon, BuildingOfficeIcon } from './Icons';
import { Project, Client, ChartDataItem, ProjectAlert, ViewerLog } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
    Layers, 
    Calendar, 
    Code, 
    ArrowRight, 
    TrendingUp,
    AlertTriangle,
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    Check,
    RotateCcw,
    Plus,
    ArrowUpRight,
    Coins,
    RefreshCw,
    MapPin,
    Globe,
    Compass,
    Laptop,
    Smartphone,
    Search,
    FileText,
    Printer,
    Copy
} from 'lucide-react';
import { 
    LineChart as RechartsLineChart, 
    Line as RechartsLine, 
    XAxis as RechartsXAxis, 
    YAxis as RechartsYAxis, 
    CartesianGrid as RechartsCartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer as RechartsResponsiveContainer 
} from 'recharts';

interface DashboardViewProps {
    projects: Project[];
    clients: { business: Client[]; personal: Client[] };
    projectAlerts?: ProjectAlert[];
    onUpdateAlerts?: (alerts: ProjectAlert[]) => void;
    viewerLogs?: ViewerLog[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
    projects, 
    clients,
    projectAlerts = [],
    onUpdateAlerts,
    viewerLogs = []
}) => {
    const { formatAmount, activeCurrency } = useCurrency();
    const [filterType, setFilterType] = useState<'all' | 'critical' | 'warning' | 'info' | 'success'>('all');
    const [showResolved, setShowResolved] = useState<boolean>(true);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [copiedReport, setCopiedReport] = useState<boolean>(false);
    
    // Telemetry and simulation options states
    const [typeScope, setTypeScope] = useState<'all' | 'service' | 'product'>('all');
    const [simMode, setSimMode] = useState<'live' | 'boosted'>('live');
    
    // Refresh states and parameters
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [refreshCounter, setRefreshCounter] = useState<number>(0);
    const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);

    // Interactive Dashboard Map states
    const [selectedUserLogId, setSelectedUserLogId] = useState<string | null>(() => {
        return viewerLogs.length > 0 ? viewerLogs[0].id : null;
    });
    const [isDashboardGoogleMapMode, setIsDashboardGoogleMapMode] = useState<boolean>(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');

    const selectedUserViewerInfo = useMemo(() => {
        if (selectedUserLogId) {
            const vLog = viewerLogs.find(l => l.id === selectedUserLogId);
            if (vLog) return vLog;
        }
        if (viewerLogs.length > 0) return viewerLogs[0];
        return {
            id: 'fallback',
            email: 'eswarganta1985@gmail.com',
            country: 'India',
            state: 'Andhra Pradesh',
            areaAddress: 'Gnanapuram, Visakhapatnam Space Park',
            latitude: 17.72,
            longitude: 83.29,
            device: 'Desktop Workstation',
            browser: 'Chrome Pro Agent v126',
            pageVisited: 'Home Feed',
            timestamp: new Date().toLocaleTimeString(),
            viewDurationMs: 120000
        };
    }, [viewerLogs, selectedUserLogId]);

    const getDashboardMapPosition = (lat: number, lng: number) => {
        const minLng = -130;
        const maxLng = 160;
        const minLat = -42;
        const maxLat = 68;

        const leftRaw = ((lng - minLng) / (maxLng - minLng)) * 100;
        const topRaw = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);

        const left = Math.min(Math.max(10, leftRaw), 90);
        const top = Math.min(Math.max(10, topRaw), 90);

        return { left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` };
    };

    const dsGoogleMapsQuery = useMemo(() => {
        const encodedAddress = encodeURIComponent(`${selectedUserViewerInfo.areaAddress}, ${selectedUserViewerInfo.state}, ${selectedUserViewerInfo.country}`);
        return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
    }, [selectedUserViewerInfo]);

    // Filter user logs by search query for lookup listing
    const filteredMapLogs = useMemo(() => {
        if (!mapSearchQuery) return viewerLogs;
        const query = mapSearchQuery.toLowerCase();
        return viewerLogs.filter(log => 
            log.email.toLowerCase().includes(query) ||
            log.country.toLowerCase().includes(query) ||
            log.state.toLowerCase().includes(query) ||
            log.areaAddress.toLowerCase().includes(query) ||
            log.pageVisited.toLowerCase().includes(query)
        );
    }, [viewerLogs, mapSearchQuery]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setRefreshSuccess(false);
        setTimeout(() => {
            setRefreshCounter(prev => prev + 1);
            setIsRefreshing(false);
            setRefreshSuccess(true);
            // Hide victory success banner after 4 seconds
            setTimeout(() => {
                setRefreshSuccess(false);
            }, 4000);
        }, 1250);
    };

    // Filter projects dynamically based on the top row's scope option
    const filteredProjectsForKPIs = useMemo(() => {
        if (typeScope === 'all') return projects;
        return projects.filter(p => p.type === typeScope);
    }, [projects, typeScope]);

    // Calculate dynamic stateful outputs for main KPIs based on refreshCounter and simMode
    const currentRevenue = useMemo(() => {
        let base = 4520000 + (refreshCounter ? Math.round(Math.sin(refreshCounter * 1.7) * 145000) : 0);
        if (simMode === 'boosted') {
            base = Math.round(base * 1.25); // +25% revenue boost in simulation mode!
        }
        return base;
    }, [refreshCounter, simMode]);

    const currentGrowth = useMemo(() => {
        let base = 15.8 + (refreshCounter ? parseFloat((Math.sin(refreshCounter * 2.3) * 1.5).toFixed(1)) : 0);
        if (simMode === 'boosted') {
            base += 4.5; // +4.5% bonus growth!
        }
        return base.toFixed(1);
    }, [refreshCounter, simMode]);

    const momGrowthDelta = useMemo(() => {
        let base = 2.4 + (refreshCounter ? parseFloat((Math.cos(refreshCounter * 1.9) * 0.9).toFixed(1)) : 0);
        if (simMode === 'boosted') {
            base += 1.2;
        }
        return parseFloat(base.toFixed(1));
    }, [refreshCounter, simMode]);

    const dashboardData = useMemo(() => {
        const clientDemographics = clients.business.reduce((acc, client) => {
            const existing = acc.find(item => item.name === client.country);
            if (existing) {
                existing.value += 1;
            } else {
                acc.push({ name: client.country, value: 1 });
            }
            return acc;
        }, [] as ChartDataItem[]);

        const revenueDistribution = filteredProjectsForKPIs.reduce((acc, project) => {
            const key = project.type === 'service' ? 'Services' : 'Products';
            const existing = acc.find(item => item.name === key);
            if (existing) {
                existing.value += 1;
            } else {
                acc.push({ name: key, value: 1 });
            }
            return acc;
        }, [] as ChartDataItem[]);

        const growthData = [
            { name: 'Jan', value: 400 + (refreshCounter ? Math.round(Math.sin(refreshCounter + 1) * 35) : 0) },
            { name: 'Feb', value: 300 + (refreshCounter ? Math.round(Math.cos(refreshCounter + 2) * 20) : 0) },
            { name: 'Mar', value: 600 + (refreshCounter ? Math.round(Math.sin(refreshCounter + 3) * 45) : 0) },
            { name: 'Apr', value: 800 + (refreshCounter ? Math.round(Math.cos(refreshCounter + 4) * 55) : 0) },
            { name: 'May', value: 500 + (refreshCounter ? Math.round(Math.sin(refreshCounter + 5) * 30) : 0) },
            { name: 'Jun', value: 900 + (refreshCounter ? Math.round(Math.cos(refreshCounter + 6) * 60) : 0) },
        ];

        const lineData = [
            { name: 'Week 1', value: 200 + (refreshCounter ? Math.round(Math.sin(refreshCounter + 1) * 15) : 0) },
            { name: 'Week 2', value: 400 + (refreshCounter ? Math.round(Math.cos(refreshCounter + 2) * 25) : 0) },
            { name: 'Week 3', value: 300 + (refreshCounter ? Math.round(Math.sin(refreshCounter + 3) * 20) : 0) },
            { name: 'Week 4', value: 500 + (refreshCounter ? Math.round(Math.cos(refreshCounter + 4) * 35) : 0) },
        ];

        return { clientDemographics, revenueDistribution, growthData, lineData };
    }, [filteredProjectsForKPIs, clients, refreshCounter]);

    const projectTrendData = useMemo(() => {
        const completedProjects = filteredProjectsForKPIs.filter(p => p.status === 'Completed' && p.endDate);
        
        let refDate = new Date();
        
        if (completedProjects.length > 0) {
            const dates = completedProjects.map(p => {
                const parsed = Date.parse(p.endDate!);
                return isNaN(parsed) ? new Date() : new Date(parsed);
            });
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
            
            if (Math.abs(refDate.getFullYear() - maxDate.getFullYear()) > 1) {
                refDate = maxDate;
            }
        }
        
        const months: { name: string; year: number; month: number; value: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            months.push({
                name: label,
                year: d.getFullYear(),
                month: d.getMonth(),
                value: 0
            });
        }
        
        completedProjects.forEach(project => {
            const pDate = new Date(project.endDate!);
            if (!isNaN(pDate.getTime())) {
                const pYear = pDate.getFullYear();
                const pMonth = pDate.getMonth();
                const matchingMonth = months.find(m => m.year === pYear && m.month === pMonth);
                if (matchingMonth) {
                    matchingMonth.value += 1;
                }
            }
        });
        
        const totalCompletions = months.reduce((sum, m) => sum + m.value, 0);
        
        const mockCompletions = [1, 2, 1, 3, 2, 4];
        return months.map((m, idx) => {
            const baseValue = totalCompletions === 0 ? mockCompletions[idx] : m.value;
            const variance = refreshCounter ? Math.round(Math.sin(refreshCounter + idx) * 1) : 0;
            return {
                name: m.name,
                value: Math.max(0, baseValue + variance)
            };
        });
    }, [filteredProjectsForKPIs, refreshCounter]);

    const handleToggleResolve = (alertId: string) => {
        if (!onUpdateAlerts) return;
        const updated = projectAlerts.map(a => a.id === alertId ? { ...a, resolved: !a.resolved } : a);
        onUpdateAlerts(updated);
    };

    const handleClearResolved = () => {
        if (!onUpdateAlerts) return;
        const updated = projectAlerts.filter(a => !a.resolved);
        onUpdateAlerts(updated);
    };

    const handleResetAlerts = () => {
        if (!onUpdateAlerts) return;
        const defaultAlerts: ProjectAlert[] = [
          {
            id: 'alert_1',
            projectId: 1,
            projectTitle: 'AI-Powered Logistics Optimization',
            type: 'critical',
            message: 'Milestone "Predictive Route Dispatcher" has missed its target deadline and is marked Delayed.',
            timestamp: '10:14:02 AM',
            resolved: false,
            milestoneName: 'Predictive Route Dispatcher'
          },
          {
            id: 'alert_2',
            projectId: 2,
            projectTitle: 'Intelligent Chatbot Assistant',
            type: 'warning',
            message: 'Milestone "Integration with MS Teams" is scheduled to end in 2 days. Fast-track peer testing required.',
            timestamp: '11:22:15 AM',
            resolved: false,
            milestoneName: 'Integration with MS Teams'
          },
          {
            id: 'alert_3',
            projectId: 3,
            projectTitle: 'Sales Forecast Predictor',
            type: 'success',
            message: 'Milestone "Regression Training Engine Pipeline" successfully passed 99.8% precision validation tests.',
            timestamp: '09:05:41 AM',
            resolved: false,
            milestoneName: 'Regression Training Engine Pipeline'
          },
          {
            id: 'alert_4',
            projectId: 1,
            projectTitle: 'AI-Powered Logistics Optimization',
            type: 'info',
            message: 'Client stakeholder checked project roadmap from Amaravati Space Park node.',
            timestamp: '08:45:10 PM',
            resolved: true
          }
        ];
        onUpdateAlerts(defaultAlerts);
    };

    const handleAddSimulatedAlert = () => {
        if (!onUpdateAlerts) return;
        const messages = [
            {
                type: 'critical' as const,
                message: 'Milestone "Secure End-to-End Encryption Setup" is Delayed by other code dependencies.',
                milestoneName: 'Secure End-to-End Encryption Setup',
                projectTitle: 'Intelligent Chatbot Assistant',
                projectId: 2
            },
            {
                type: 'warning' as const,
                message: 'Stripe webhook listener returns 401 code context. Immediate secret keys verify required.',
                projectTitle: 'Sales Forecast Predictor',
                projectId: 3
            },
            {
                type: 'success' as const,
                message: 'Visual regression benchmarks completed successfully for Amaravati Dashboard UI layers.',
                projectTitle: 'AI-Powered Logistics Optimization',
                projectId: 1
            },
            {
                type: 'info' as const,
                message: 'Auditor review completed for TCS integration code guidelines. Ready to ship.',
                projectTitle: 'AI-Powered Logistics Optimization',
                projectId: 1
            },
            {
                type: 'warning' as const,
                message: 'Database storage pool exceeds 85% allotment capacity under high evaluation traffic.',
                projectTitle: 'Intelligent Chatbot Assistant',
                projectId: 2
            }
        ];
        const randomMeta = messages[Math.floor(Math.random() * messages.length)];
        const newAlert: ProjectAlert = {
            id: 'sim_alert_' + Date.now(),
            projectId: randomMeta.projectId,
            projectTitle: randomMeta.projectTitle,
            type: randomMeta.type,
            message: randomMeta.message,
            timestamp: new Date().toLocaleTimeString(),
            resolved: false,
            milestoneName: randomMeta.milestoneName
        };
        onUpdateAlerts([newAlert, ...projectAlerts]);
    };

    const filteredAlerts = useMemo(() => {
        return projectAlerts.filter(alert => {
            const matchesType = filterType === 'all' || alert.type === filterType;
            const matchesResolution = showResolved ? true : !alert.resolved;
            return matchesType && matchesResolution;
        });
    }, [projectAlerts, filterType, showResolved]);

    const getProjectProgress = (project: Project): number => {
        if (project.milestones && project.milestones.length > 0) {
            const completed = project.milestones.filter(m => m.status === 'Completed').length;
            return Math.round((completed / project.milestones.length) * 100);
        }
        switch (project.status) {
            case 'Completed':
                return 100;
            case 'In Progress':
                return 60;
            case 'On Hold':
                return 30;
            case 'Not Started':
            default:
                return 0;
        }
    };

    const activeBusinessCount = clients.business?.length || 0;
    const activePersonalCount = clients.personal?.length || 0;
    const totalActiveClients = activeBusinessCount + activePersonalCount;

    // Project Health breakdown variables
    const totalProjects = filteredProjectsForKPIs.length;
    const completedProjectsCount = filteredProjectsForKPIs.filter(p => p.status === 'Completed').length;
    const inProgressProjectsCount = filteredProjectsForKPIs.filter(p => p.status === 'In Progress').length;
    const onHoldProjectsCount = filteredProjectsForKPIs.filter(p => p.status === 'On Hold').length;
    const pendingProjectsCount = filteredProjectsForKPIs.filter(p => p.status === 'Not Started').length;

    const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjectsCount / totalProjects) * 100) : 0;

    const RefreshingOverlay = () => (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-10 animate-fade-in transition-all duration-300">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white shadow-md border border-slate-100">
                <svg className="animate-spin h-5 w-5 text-indigo-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">RECALCULATING...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* EXECUTIVE REFRESH & MULTI-OPTION ADAPTIVE PANEL Header */}
            <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-150 p-6 md:p-8 lg:p-10 -mx-4 sm:-mx-8 lg:-mx-12 rounded-none md:rounded-2xl border-x-0 md:border-x shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-indigo-50/20 rounded-full opacity-35 blur-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-teal-50/20 rounded-full opacity-25 blur-xl pointer-events-none" />
                
                <div className="space-y-1.5 z-10 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] bg-slate-100 border border-slate-200 text-slate-500 font-extrabold tracking-wider uppercase font-mono">
                            Console v2.5
                        </span>
                        <h2 className="text-xs xs:text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                            <span>Corporate Intelligence Dashboard</span>
                        </h2>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold animate-pulse font-mono">
                            ● Active Live Sync
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                        Consolidated telemetry tracker across enterprise solution pipelines, financial transaction charts, and active milestone metrics.
                    </p>
                </div>

                {/* OPTIONS & CONTROLS SECTION */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 relative z-10 self-stretch xl:self-auto shrink-0">
                    {/* OPTION PILL: SOLUTION TYPE Filter */}
                    <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center gap-0.5">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider px-1.5 block font-mono">Scope:</span>
                        {[
                            { id: 'all', label: 'All Solutions' },
                            { id: 'service', label: 'Services Only' },
                            { id: 'product', label: 'Products Only' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setTypeScope(opt.id as any)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap ${
                                    typeScope === opt.id
                                        ? 'bg-indigo-600 text-white shadow-xs font-black'
                                        : 'text-slate-550 hover:text-slate-850 hover:bg-slate-200/50'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* OPTION PILL: SIM MODE */}
                    <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center gap-0.5">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider px-1.5 block font-mono">Mode:</span>
                        {[
                            { id: 'live', label: 'Live' },
                            { id: 'boosted', label: 'Boosted' }
                        ].map(sm => (
                            <button
                                key={sm.id}
                                onClick={() => {
                                    setSimMode(sm.id as any);
                                    if (sm.id === 'boosted') {
                                        handleRefresh();
                                    }
                                }}
                                className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap ${
                                    simMode === sm.id
                                        ? 'bg-slate-900 text-white shadow-xs font-black'
                                        : 'text-slate-550 hover:text-slate-850 hover:bg-slate-200/50'
                                }`}
                            >
                                {sm.label}
                            </button>
                        ))}
                    </div>

                    {/* ACTION TRIGGERS */}
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                        {refreshSuccess && (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2 py-1 text-[9px] font-black animate-fadeIn flex items-center gap-1 whitespace-nowrap">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full inline-block animate-ping" />
                                <span>SYNCED</span>
                            </div>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[9.5px] font-black tracking-wider uppercase shadow-xs transition-all border select-none cursor-pointer whitespace-nowrap ${
                                isRefreshing 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-750 border-indigo-550 hover:border-indigo-600 text-white hover:shadow-xs'
                            }`}
                        >
                            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>{isRefreshing ? 'Syncing...' : 'Sync Metrics'}</span>
                        </button>

                        <button
                            onClick={() => setShowReportModal(true)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[9.5px] font-black tracking-wider uppercase shadow-xs transition-all border border-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white select-none cursor-pointer whitespace-nowrap hover:shadow-md"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Report</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PERFORMANCE INSIGHTS KPI SUMMARY ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI CARD: TOTAL REVENUE */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[165px]">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-50 rounded-full opacity-40 blur-md pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total Revenue
                        </span>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            {activeCurrency.code === 'INR' ? (
                                <IndianRupeeIcon className="w-5 h-5" />
                            ) : (
                                <Coins className="w-5 h-5 text-emerald-600" />
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800 tracking-tight">
                            {formatAmount(currentRevenue, 'short')}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100">
                                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                +12.5%
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold border-b border-dashed border-slate-200" title="Values converted dynamically based on real-time relative baseline calculations">
                                converted to {activeCurrency.code}
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-3 pt-3 border-t border-slate-50">
                        Cumulative billing across all active core service pipelines
                    </p>
                    {isRefreshing && <RefreshingOverlay />}
                </div>

                {/* KPI CARD: MONTHLY GROWTH */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-violet-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[165px]">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-violet-50 rounded-full opacity-40 blur-md pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Monthly Growth
                        </span>
                        <div className="p-2.5 bg-violet-50 text-violet-600 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
                            +{currentGrowth}%
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-0.5 bg-violet-50 text-violet-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-violet-100">
                                <ArrowUpRight className="w-3 h-3 text-violet-600" />
                                {momGrowthDelta > 0 ? `+${momGrowthDelta}%` : `${momGrowthDelta}%`} MoM
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                                visitor sessions expansion
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-3 pt-3 border-t border-slate-50">
                        Escalated project evaluations and global client interactions
                    </p>
                    {isRefreshing && <RefreshingOverlay />}
                </div>

                {/* KPI CARD: ACTIVE CLIENTS */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[165px]">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-teal-50 rounded-full opacity-40 blur-md pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Active Clients
                        </span>
                        <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
                            <BuildingOfficeIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800 tracking-tight">
                            {totalActiveClients}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-0.5 bg-teal-50 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-teal-100">
                                <ArrowUpRight className="w-3 h-3 text-teal-600" />
                                +3 New
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                                partnerships this month
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-3 pt-3 border-t border-slate-50">
                        Currently serving <span className="font-extrabold text-teal-600">{activeBusinessCount} Enterprise</span> & <span className="font-extrabold text-teal-600">{activePersonalCount} Custom</span> entities
                    </p>
                    {isRefreshing && <RefreshingOverlay />}
                </div>

                {/* KPI CARD: PROJECT HEALTH */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[165px]">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-sky-50 rounded-full opacity-40 blur-md pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Project Health
                        </span>
                        <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-slate-800 tracking-tight">
                                {projectCompletionRate}%
                            </div>
                            <div className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                                Completed: <span className="text-emerald-600 font-extrabold">{completedProjectsCount}</span>
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center flex-shrink-0">
                            {/* SVG Progress Ring */}
                            <svg className="w-14 h-14 transform -rotate-90">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    className="stroke-slate-100"
                                    strokeWidth="4"
                                    fill="transparent"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    className="stroke-sky-500 transition-all duration-1000 ease-out"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 22}
                                    strokeDashoffset={2 * Math.PI * 22 - (projectCompletionRate / 100) * (2 * Math.PI * 22)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-[10px] font-black text-sky-600">{projectCompletionRate}%</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-3 pt-3 border-t border-slate-50 flex items-center justify-between gap-1">
                        <span>Active: <span className="font-bold text-yellow-600">{inProgressProjectsCount}</span></span>
                        <span>On Hold: <span className="font-bold text-amber-600">{onHoldProjectsCount}</span></span>
                        <span>Pending: <span className="font-bold text-slate-600">{pendingProjectsCount}</span></span>
                    </p>
                    {isRefreshing && <RefreshingOverlay />}
                </div>
            </div>

            {/* KESTREL PROJECT STATUS ALERTS BOARD */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-100 relative">
                            <Bell className="w-5 h-5 animate-swing" />
                            {projectAlerts.filter(a => !a.resolved).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold rounded-full w-4 h-4 text-[9px] flex items-center justify-center animate-pulse">
                                    {projectAlerts.filter(a => !a.resolved).length}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <span>Project Status Alerts Center</span>
                                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold normal-case">
                                    {projectAlerts.filter(a => !a.resolved).length} active alerts
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Automated tracking of project health, milestone completion delays, precision validations, and stakeholder reviews.
                            </p>
                        </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleAddSimulatedAlert}
                            className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Simulate Project Alert</span>
                        </button>
                        
                        <button
                            onClick={handleClearResolved}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                            title="Clear resolved notifications"
                        >
                            <span>Clear Resolved</span>
                        </button>

                        <button
                            onClick={handleResetAlerts}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                            title="Reset standard set of notifications"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Default</span>
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-2">Severity:</span>
                        {[
                            { id: 'all', label: 'All Alerts', color: 'bg-white text-slate-800' },
                            { id: 'critical', label: 'Critical Only', color: 'bg-rose-100/70 text-rose-700 border-rose-200' },
                            { id: 'warning', label: 'Warnings', color: 'bg-amber-150 text-amber-700 border-amber-200' },
                            { id: 'success', label: 'Pass / Success', color: 'bg-emerald-100/70 text-emerald-700 border-emerald-200 border' },
                            { id: 'info', label: 'Info Updates', color: 'bg-blue-100/70 text-blue-700 border-blue-200' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterType(tab.id as any)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                    filterType === tab.id 
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-black' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-bold">
                        <input
                            type="checkbox"
                            checked={showResolved}
                            onChange={(e) => setShowResolved(e.target.checked)}
                            className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Show resolved alerts</span>
                    </label>
                </div>

                {/* Notification List Panel */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map(alert => {
                            let borderTheme = 'border-l-4 border-l-blue-500';
                            let iconElement = <Info className="w-4 h-4 text-blue-500" />;
                            let bgTheme = 'bg-blue-50/20';

                            if (alert.type === 'critical') {
                                borderTheme = 'border-l-4 border-l-rose-500 animate-pulse-subtle';
                                iconElement = <AlertCircle className="w-4 h-4 text-rose-500" />;
                                bgTheme = 'bg-rose-50/10 hover:bg-rose-50/20';
                            } else if (alert.type === 'warning') {
                                borderTheme = 'border-l-4 border-l-amber-500';
                                iconElement = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                                bgTheme = 'bg-amber-50/10 hover:bg-amber-50/20';
                            } else if (alert.type === 'success') {
                                borderTheme = 'border-l-4 border-l-emerald-500';
                                iconElement = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                                bgTheme = 'bg-emerald-50/10 hover:bg-emerald-50/20';
                            }

                            return (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-xl border border-slate-100 flex items-start gap-3.5 transition-all ${borderTheme} ${bgTheme} ${
                                        alert.resolved ? 'opacity-55 saturate-50' : ''
                                    }`}
                                >
                                    <div className="p-1.5 bg-white rounded-lg shadow-xs flex-shrink-0 border border-slate-100">
                                        {iconElement}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-black text-slate-800 truncate" title={alert.projectTitle}>
                                                {alert.projectTitle}
                                            </span>
                                            {alert.milestoneName && (
                                                <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                                                    Milestone: {alert.milestoneName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                            {alert.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-bold font-mono">
                                            <span>TIME: {alert.timestamp}</span>
                                            {alert.resolved ? (
                                                <span className="text-emerald-600 flex items-center gap-0.5">
                                                    <Check className="w-3 h-3 font-semibold" /> RESOLVED
                                                </span>
                                            ) : (
                                                <span className="text-rose-500 animate-pulse">● UNRESOLVED</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <button
                                        onClick={() => handleToggleResolve(alert.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 bg-white border shadow-xs transition-colors cursor-pointer ${
                                            alert.resolved 
                                                ? 'hover:bg-slate-50 border-slate-200 text-slate-500' 
                                                : 'hover:bg-indigo-50 border-indigo-200 text-indigo-600'
                                        }`}
                                    >
                                        {alert.resolved ? (
                                            <>
                                                <span>Reopen</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-3 h-3 text-indigo-600" />
                                                <span>Resolve</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-450 text-xs font-medium bg-slate-50/40">
                            No project health status alerts match the filtered parameters.
                        </div>
                    )}
                </div>
                {isRefreshing && <RefreshingOverlay />}
            </div>

            {/* ACTIVE PROJECT TIMELINES & MILESTONES SCHEDULE */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                Active Project Timelines & Milestones Schedule
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Tracking execution milestones, delivery phases, and scheduled trajectory of current projects.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {projects.map((project) => {
                        const progress = getProjectProgress(project);
                        const progressBg = 
                            project.status === 'Completed' ? 'bg-emerald-500' :
                            project.status === 'In Progress' ? 'bg-blue-500' :
                            project.status === 'On Hold' ? 'bg-amber-500' :
                            'bg-slate-400';
                        const statusColor = 
                            project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            project.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100';

                        return (
                            <div key={project.id} className="group border border-slate-100 rounded-xl p-5 hover:bg-slate-50/40 hover:shadow-md transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-extrabold text-slate-800 text-base group-hover:text-indigo-650 transition-colors">
                                                {project.title}
                                            </h4>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusColor}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold mt-0.5">
                                            Client Entity: <span className="text-indigo-600/80">{project.client || 'Internal Product'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right sm:text-right text-[11px] font-bold text-slate-400">
                                        <span className="bg-slate-150 text-slate-600 px-2.5 py-1 rounded-md">
                                            {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBD'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Project Timeline Gantt Tracker */}
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                                            <span className="text-slate-400 uppercase text-[10px]">Overall Milestone Progress</span>
                                            <span className="text-indigo-600">{progress}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                                            <div 
                                                className={`h-full ${progressBg} transition-all duration-500`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Milestone Path Nodes */}
                                    {project.milestones && project.milestones.length > 0 && (
                                        <div className="pt-2">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-3">Milestones Path</span>
                                            <div className="relative pl-4 border-l border-slate-200 ml-2 space-y-4">
                                                {project.milestones.map((milestone) => {
                                                    let nodeColor = 'bg-slate-300';
                                                    let textColor = 'text-slate-500';
                                                    if (milestone.status === 'Completed') {
                                                        nodeColor = 'bg-emerald-500 ring-4 ring-emerald-50';
                                                        textColor = 'text-emerald-700 font-bold';
                                                    } else if (milestone.status === 'In Progress') {
                                                        nodeColor = 'bg-blue-500 ring-4 ring-blue-50';
                                                        textColor = 'text-blue-700 font-bold';
                                                    } else if (milestone.status === 'Delayed') {
                                                        nodeColor = 'bg-rose-500 ring-4 ring-rose-50';
                                                        textColor = 'text-rose-700 font-bold';
                                                    }

                                                    return (
                                                        <div key={milestone.id} className="relative flex items-center justify-between gap-4 text-xs">
                                                            {/* Node Indicator */}
                                                            <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full ${nodeColor}`} />
                                                            <div className="min-w-0 flex-1">
                                                                <span className={`block truncate ${textColor}`}>
                                                                    {milestone.name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold">
                                                                    Target Deadline: {new Date(milestone.dueDate).toLocaleDateString('en-IN', {month: 'short', day: 'numeric', year: 'numeric'})}
                                                                </span>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                                milestone.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                                                                milestone.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                                                                milestone.status === 'Delayed' ? 'bg-rose-50 text-rose-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {milestone.status}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isRefreshing && <RefreshingOverlay />}
            </div>

            {/* ACTIVE CLIENTS PLACEMENT RADAR MAP SECTION */}
            <ClientPlacementMap clients={clients} />

            {/* ACTIVE USERS GEOGRAPHIC LOCATION MAP SECTION */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-150 p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-650 border border-indigo-100">
                            <Globe className="w-5 h-5 text-indigo-600 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                Active Users & Clients Geographic Distribution
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Visualizing live geographic locations, viewer retention log records, and key visitor profile telemetry.
                            </p>
                        </div>
                    </div>
                    
                    {/* Map Selection toggle */}
                    <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg select-none self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setIsDashboardGoogleMapMode(false)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                !isDashboardGoogleMapMode 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-805 font-bold'
                            }`}
                        >
                            Mock GPS Radar
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDashboardGoogleMapMode(true)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                isDashboardGoogleMapMode 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-805 font-bold'
                            }`}
                        >
                            Google Maps Embed
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* LEFT / CENTER: THE VISUAL MAP VIEWPORT (2/3 size) */}
                    <div className="xl:col-span-2 space-y-3">
                        <div className="aspect-video w-full h-[320px] sm:h-[380px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner">
                            {!isDashboardGoogleMapMode ? (
                                /* Interactive GIS coordinate dot radar map */
                                <div className="w-full h-full relative cursor-crosshair select-none flex items-center justify-center overflow-hidden bg-[#0A0F1D]">
                                    
                                    {/* Neon circular pulse guides */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                        <div className="w-24 h-24 rounded-full border border-indigo-500 animate-ping" />
                                        <div className="w-48 h-48 rounded-full border border-dashed border-indigo-400" />
                                        <div className="w-80 h-80 rounded-full border border-dashed border-indigo-300" />
                                        <div className="w-[450px] h-[450px] rounded-full border border-indigo-500/20" />
                                    </div>

                                    {/* Radar rotating blade */}
                                    <div className="absolute w-[500px] h-[500px] origin-center rounded-full pointer-events-none animate-spin-radar opacity-15 bg-[conic-gradient(from_0deg,transparent_70%,rgba(99,102,241,0.4)_100%)]" />

                                    {/* Coordinate grid helper lines */}
                                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                                        {Array.from({ length: 36 }).map((_, i) => (
                                            <div key={i} className="border border-indigo-100" />
                                        ))}
                                    </div>

                                    {/* Geographic status telemetry overlay */}
                                    <div className="absolute top-4 left-4 font-mono text-[9px] text-indigo-400/90 tracking-wider space-y-0.5 pointer-events-none select-none">
                                        <div>LAT_SECURED: {selectedUserViewerInfo.latitude}° N</div>
                                        <div>LNG_SECURED: {selectedUserViewerInfo.longitude}° E</div>
                                        <div>ACTIVE_SESSIONS: {viewerLogs.length}</div>
                                        <div className="text-emerald-500 font-bold text-[8px] flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            CONNECTED
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 right-4 font-mono text-[8px] text-slate-505 uppercase tracking-widest text-right pointer-events-none select-none">
                                        <div>GIS STAGE: ACTIVE_USERS</div>
                                        <div>KESTREL DASHBOARD MAP</div>
                                    </div>

                                    {/* Center Highlighted user pointer */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.8)] border-2 border-white animate-bounce">
                                            <MapPin className="w-3.5 h-3.5 text-white fill-white" />
                                        </div>
                                        <div className="mt-2 bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-md text-center max-w-[200px] shadow-2xl backdrop-blur-xs">
                                            <div className="text-[10px] font-black text-indigo-400 truncate">{selectedUserViewerInfo.email}</div>
                                            <div className="text-[9px] font-bold text-white mt-0.5">{selectedUserViewerInfo.areaAddress}</div>
                                        </div>
                                    </div>

                                    {/* Active viewer logs coordinate dots */}
                                    {viewerLogs.map((v) => {
                                        const pos = getDashboardMapPosition(v.latitude, v.longitude);
                                        const isSelected = selectedUserLogId === v.id;
                                        return (
                                            <div
                                                key={v.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUserLogId(v.id);
                                                }}
                                                className="absolute group z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-130"
                                                style={{ left: pos.left, top: pos.top }}
                                            >
                                                {/* Pulsing glow ring */}
                                                <span className={`absolute inline-flex h-5 w-5 rounded-full opacity-60 animate-ping -left-2 -top-2 ${
                                                    isSelected ? 'bg-indigo-400' : 'bg-emerald-400'
                                                }`} />
                                                
                                                {/* Dot core */}
                                                <div className={`h-3 w-3 rounded-full border border-white shadow-md ${
                                                    isSelected ? 'bg-indigo-500 ring-4 ring-indigo-300 scale-125' : 'bg-emerald-400'
                                                }`} />

                                                {/* Card tooltip */}
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg shadow-xl text-[10.5px] w-48 z-40 backdrop-blur-xs pointer-events-none text-left">
                                                    <div className="font-extrabold text-indigo-400 truncate">{v.email}</div>
                                                    <div className="text-slate-200 mt-1 font-medium leading-tight">{v.areaAddress}, {v.country}</div>
                                                    <div className="text-slate-400 font-mono mt-0.5 text-[9.5px]">Visited: {v.pageVisited}</div>
                                                    <div className="text-[9px] text-indigo-300 animate-pulse font-extrabold mt-1">CLICK TO PINPOINT</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <iframe
                                    id="dashboard-geographic-google-map"
                                    title="Dashboard Active User Google Map"
                                    className="w-full h-full border-none shadow-inner"
                                    src={dsGoogleMapsQuery}
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            )}

                            <div className="absolute bottom-2 left-2 right-2 bg-[#0A0F1D]/90 border border-slate-800 rounded-lg p-2.5 flex items-start gap-2 backdrop-blur-xs">
                                <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-300 leading-normal">
                                    Click any active user dot on the coordinate radar screen to zoom, center, view detailed profile details, and toggle standard Google Maps.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: SELECTED TARGET SESSION PROFILE & TOTAL LOGS LOOKUP (1/3 size) */}
                    <div className="flex flex-col justify-between space-y-4">
                        {/* Map Target Profile info card */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 self-stretch">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                                <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                                    <Compass className="w-4 h-4 animate-spin-slow" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Inspection Profile</span>
                                    <h4 className="text-xs font-black text-slate-800 truncate max-w-[200px]" title={selectedUserViewerInfo.email}>
                                        {selectedUserViewerInfo.email}
                                    </h4>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs text-slate-700 font-semibold">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Country / State</span>
                                        <span className="text-slate-800 font-extrabold truncate block">{selectedUserViewerInfo.country}, {selectedUserViewerInfo.state}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Coordinates</span>
                                        <span className="text-indigo-650 font-mono font-bold block">{selectedUserViewerInfo.latitude.toFixed(2)}° N / {selectedUserViewerInfo.longitude.toFixed(2)}° E</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Exact Area Address</span>
                                    <div className="flex items-start gap-1.5 text-slate-700 leading-snug mt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                        <span>{selectedUserViewerInfo.areaAddress}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Current Page</span>
                                        <span className="text-slate-800 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md inline-block font-extrabold mt-0.5 truncate max-w-full">{selectedUserViewerInfo.pageVisited}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Client Hardware</span>
                                        <div className="flex items-center gap-1 text-slate-600 mt-0.5">
                                            {selectedUserViewerInfo.device.toLowerCase().includes('phone') || selectedUserViewerInfo.device.toLowerCase().includes('mobile') ? (
                                                <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                                            ) : (
                                                <Laptop className="w-3 h-3 text-slate-400 shrink-0" />
                                            )}
                                            <span className="truncate max-w-[120px]" title={selectedUserViewerInfo.device}>{selectedUserViewerInfo.device}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List lookup search filter for direct coordinate targeting */}
                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-2">Target Active List Lookup</span>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={mapSearchQuery}
                                        onChange={(e) => setMapSearchQuery(e.target.value)}
                                        placeholder="Direct search user or state..."
                                        className="pl-8.5 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 w-full transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="max-h-40 overflow-y-auto border border-slate-150 rounded-xl divide-y divide-slate-100 mt-2 bg-slate-50/20">
                                {filteredMapLogs.length > 0 ? (
                                    filteredMapLogs.map((log) => (
                                        <button
                                            key={log.id}
                                            type="button"
                                            onClick={() => setSelectedUserLogId(log.id)}
                                            className={`w-full text-left px-3.5 py-2 transition-all flex items-center justify-between text-xs hover:bg-slate-50 group cursor-pointer ${
                                                selectedUserLogId === log.id 
                                                    ? 'bg-indigo-50/70 border-l-4 border-indigo-650' 
                                                    : 'border-l-4 border-transparent'
                                            }`}
                                        >
                                            <div className="truncate pr-2">
                                                <div className={`font-black group-hover:text-indigo-700 truncate ${selectedUserLogId === log.id ? 'text-indigo-750' : 'text-slate-805'}`}>
                                                    {log.email}
                                                </div>
                                                <p className="text-[9.5px] text-slate-450 truncate">{log.areaAddress}, {log.country}</p>
                                            </div>
                                            <span className="text-[9px] font-mono text-slate-400 font-bold justify-self-end text-right flex-shrink-0">
                                                {log.timestamp}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-slate-400 font-bold">
                                        No active matching users
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative overflow-hidden">
                <GrowthChart data={dashboardData.growthData} title="Company Growth (Monthly)" />
                <CustomPieChart data={dashboardData.clientDemographics} title="Client Demographics" />
                {isRefreshing && <RefreshingOverlay />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative overflow-hidden">
                <CustomLineChart data={dashboardData.lineData} title="Weekly Performance" />
                <CustomPieChart data={dashboardData.revenueDistribution} title="Revenue by Type" />
                {isRefreshing && <RefreshingOverlay />}
            </div>

            {/* Project Completion Trend Section utilising Recharts */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-50/85 rounded-xl text-[#14B8A6] border border-emerald-100">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                                Project Completion Trend (Last 6 Months)
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Visualizing completed solutions and enterprise AI applications over a trailing 6-month timeline.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                        <span className="w-2 rounded-full bg-[#14B8A6] h-2 inline-block mr-1.5" />
                        Completed Count
                    </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                    <RechartsResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={projectTrendData} margin={{ top: 15, right: 20, left: -25, bottom: 5 }}>
                            <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <RechartsXAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10} 
                                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 550 }} 
                            />
                            <RechartsYAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 550 }}
                                allowDecimals={false}
                            />
                            <RechartsTooltip
                                cursor={{ stroke: '#14B8A6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    borderRadius: '0.75rem', 
                                    borderColor: '#E2E8F0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                                }}
                                labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '0.25rem' }}
                                itemStyle={{ color: '#14B8A6', fontWeight: 'bold' }}
                            />
                            <RechartsLine 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#14B8A6" 
                                strokeWidth={3} 
                                name="Completed Projects"
                                dot={{ r: 5, fill: '#14B8A6', stroke: '#FFFFFF', strokeWidth: 2 }} 
                                activeDot={{ r: 7, stroke: '#14B8A6', strokeWidth: 2, fill: '#FFFFFF' }}
                            />
                        </RechartsLineChart>
                    </RechartsResponsiveContainer>
                </div>
                {isRefreshing && <RefreshingOverlay />}
            </div>

            {/* Current Project Statuses Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50/80 rounded-xl text-kestrel-blue border border-blue-100">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                                Current Project Portfolio Status
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Tracking delivery progress, technology integrations, and major milestones real-time.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">
                            {projects.length} Total Projects
                        </span>
                        <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            {projects.filter(p => p.status === 'Completed').length} Completed
                        </span>
                        <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                            {projects.filter(p => p.status === 'In Progress').length} In Progress
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table id="project-statuses-table" className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                                <th scope="col" className="px-5 py-4 text-left">Project Name</th>
                                <th scope="col" className="px-5 py-4 text-center">Status</th>
                                <th scope="col" className="px-5 py-4 text-left min-w-[120px]">Progress Percentage</th>
                                <th scope="col" className="px-5 py-4 text-left hidden md:table-cell">Schedule Period</th>
                                <th scope="col" className="px-5 py-4 text-left">Primary Technology Stack</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {projects.map((project) => {
                                const progress = getProjectProgress(project);
                                const techStack = project.technologies || project.features || ['AI Solution'];
                                
                                let statusStyles = 'bg-slate-50 text-slate-605 border-slate-200';
                                if (project.status === 'Completed') {
                                    statusStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                } else if (project.status === 'In Progress') {
                                    statusStyles = 'bg-blue-50 text-blue-700 border-blue-200';
                                } else if (project.status === 'On Hold') {
                                    statusStyles = 'bg-amber-50 text-amber-700 border-amber-200';
                                }

                                return (
                                    <tr key={project.id} className="hover:bg-slate-50/40 transition-colors">
                                        {/* Project Title */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1 max-w-[280px]">
                                                <div className="font-bold text-slate-900 truncate" title={project.title}>
                                                    {project.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                                                    <span className="font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                        {project.type}
                                                    </span>
                                                    {project.client && (
                                                        <span className="truncate">
                                                            • Client: {project.client}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Colored Status Badge */}
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusStyles}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    project.status === 'Completed' ? 'bg-emerald-500' :
                                                    project.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                                                }`} />
                                                {project.status}
                                            </span>
                                        </td>

                                        {/* Progress Bar & Numeric Indicator */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[11px] font-bold">
                                                    <span className="text-slate-800 font-mono">{progress}%</span>
                                                    {project.milestones && project.milestones.length > 0 && (
                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                            {project.milestones.filter(m => m.status === 'Completed').length}/{project.milestones.length} Milestones
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-xs border border-slate-200/40">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            progress === 100 ? 'bg-emerald-500' :
                                                            progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date Schedule Period */}
                                        <td className="px-5 py-4 text-slate-500 text-[11px] hidden md:table-cell font-mono">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                <span>
                                                    {project.startDate ? project.startDate : 'N/A'}
                                                </span>
                                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                                <span className="font-bold text-slate-700">
                                                    {project.endDate ? project.endDate : 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Technology Tags */}
                                        <td className="px-5 py-4 col-span-1">
                                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                {techStack.slice(0, 3).map((tech, i) => (
                                                    <span 
                                                        key={i} 
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold"
                                                    >
                                                        <Code className="w-2.5 h-2.5 text-slate-400" />
                                                        {tech}
                                                    </span>
                                                ))}
                                                {techStack.length > 3 && (
                                                    <span className="text-[9px] font-bold text-slate-450 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5" title={`${techStack.slice(3).join(', ')}`}>
                                                        +{techStack.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {isRefreshing && <RefreshingOverlay />}
            </div>

            {/* HIGH-FIDELITY INTERACTIVE DOCUMENT REPORT MODAL (WITH CHROME@MEDIA PRINT LAYOUT CORES) */}
            {showReportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto printable-report-modal" id="printable-report-modal">
                    {/* Print isolated styling rules block to automate beautiful physical print pages */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media print {
                            html, body {
                                background-color: white !important;
                                color: black !important;
                                font-size: 11pt !important;
                            }
                            #root, header, footer, nav, .print-action-bar, #dashboard-geographic-google-map {
                                display: none !important;
                            }
                            #printable-report-modal {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: auto !important;
                                background-color: white !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                display: block !important;
                                overflow: visible !important;
                                box-shadow: none !important;
                            }
                            .printable-report-document {
                                width: 100% !important;
                                max-width: 100% !important;
                                box-shadow: none !important;
                                border: none !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                background-color: white !important;
                            }
                            .modal-scroller-area {
                                overflow: visible !important;
                                max-height: none !important;
                            }
                            .print-action-bar {
                                display: none !important;
                            }
                            .print-chart-bg {
                                background-color: #F8FAFC !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            .print-theme-border {
                                border-color: #E2E8F0 !important;
                            }
                        }
                    `}} />
                    
                    <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 sm:my-8 pointer-events-auto relative printable-report-document animate-fadeIn">
                        {/* Interactive operational bar (hidden when printed physically) */}
                        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-action-bar">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider">Executive Report Generator</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold">Printable PDF document & data synchronization portal</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                    onClick={() => {
                                        const markdown = `
# KESTREL AI SOLUTIONS – EXECUTIVE TELEMETRY & RECONCILIATION REPORT
Generated on: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
System Baseline: Console v2.5
Baseline Mode: ${simMode === 'boosted' ? 'Enterprise Boosted Mode' : 'Standard Live Mode'}
Report ID: REP-${new Date().getTime().toString().slice(-6)}

---

## 1. STRATEGIC KPI TRACKERS
- **Estimated Total Revenue**: ${activeCurrency.code === 'INR' ? '₹' : activeCurrency.code === 'USD' ? '$' : activeCurrency.code} ${currentRevenue.toLocaleString()}
- **Trailing Monthly Growth**: +${currentGrowth}%
- **Registered Partner Entities**: ${totalActiveClients} clients (${activeBusinessCount} enterprise, ${activePersonalCount} custom contracts)
- **Active Project Portfolio Health**: ${projectCompletionRate}% completion baseline

---

## 2. PORTFOLIO STATUS METRICS
${projects.map(p => `- **${p.title}** (${p.type === 'service' ? 'Service Pipeline' : 'Product Line'})
  * Client: ${p.client || 'Internal Product'}
  * Project Status: ${p.status}
  * Overall Progress: ${getProjectProgress(p)}%
  * Tech Stack: ${(p.technologies || p.features || []).join(', ')}
  * Delivery Window: ${p.startDate || 'TBD'} to ${p.endDate || 'TBD'}`).join('\n')}

---

## 3. CHANNELS & TELEMETRY CHARTS BREAKDOWN
### Trailing Monthly Company Growth
${dashboardData.growthData.map(d => `- ${d.name}: ${d.value} evaluations`).join('\n')}

### Weekly Work Performance
${dashboardData.lineData.map(d => `- ${d.name}: ${d.value} points`).join('\n')}

### Revenue Distribution by Division Category
${dashboardData.revenueDistribution.map(d => `- ${d.name}: ${d.value} core pipelines`).join('\n')}

### Client Demographics
${dashboardData.clientDemographics.map(d => `- ${d.name || 'Global'}: ${d.value} accounts`).join('\n')}

---

## 4. PROJECT STATUS ALERTS REGISTER
${projectAlerts.length > 0 ? projectAlerts.map(a => `- [${a.resolved ? 'RESOLVED' : 'UNRESOLVED'}] [${a.type.toUpperCase()}] **${a.projectTitle}** ${a.milestoneName ? `(Milestone: ${a.milestoneName})` : ''}
  * Message: ${a.message}
  * Timestamp: ${a.timestamp}`).join('\n') : 'No active alerts dispatched.'}

---
CONFIDENTIAL DISCLOSURE – FOR CORPORATE STAKEHOLDERS ONLY.
                                        `.trim();
                                        navigator.clipboard.writeText(markdown);
                                        setCopiedReport(true);
                                        setTimeout(() => setCopiedReport(false), 2000);
                                    }}
                                    className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                >
                                    {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                    <span>{copiedReport ? 'Copied' : 'Copy Plaintext'}</span>
                                </button>
                                
                                <button
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print / Save PDF</span>
                                </button>
                                
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-700 ml-1"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        
                        {/* Main printable report ledger document */}
                        <div className="p-6 sm:p-10 text-slate-800 space-y-8 overflow-y-auto max-h-[75vh] modal-scroller-area bg-white printable-area">
                            {/* Visual Logo & Corporate Metadata block */}
                            <div className="border-b-4 border-indigo-600 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                                            <span className="text-indigo-650 font-extrabold pb-0.5">Kestrel</span>
                                            <span className="bg-indigo-650 text-white px-1.5 py-0.5 rounded-md text-[13px] font-black tracking-wide leading-none uppercase">AI Solutions</span>
                                        </span>
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wider uppercase">Executive Reconciliation Report</h1>
                                    <p className="text-xs text-slate-550 font-bold max-w-xl leading-relaxed">
                                        Consolidated systems telemetry pipeline, financials audit, development velocity milestones, and deployed production incident warnings.
                                    </p>
                                </div>
                                
                                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-xs font-semibold text-slate-600 max-w-xs space-y-1 w-full md:w-auto print-chart-bg">
                                    <div><span className="text-slate-400 font-bold uppercase text-[9px] block">REPORT IDENTIFIER</span> <span className="font-mono text-slate-900 font-extrabold">REP-2026-{new Date().getTime().toString().slice(-6)}</span></div>
                                    <div className="pt-2"><span className="text-slate-400 font-bold uppercase text-[9px] block">COMPILED STAGE</span> <span className="text-slate-800 font-bold">{new Date().toLocaleString('en-IN', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span></div>
                                    <div className="pt-1"><span className="text-slate-400 font-bold uppercase text-[9px] block">BASELINE STATUS</span> <span className="text-emerald-750 font-black uppercase flex items-center gap-1">● sync completed</span></div>
                                </div>
                            </div>

                            {/* 1. FINANCIAL & SYSTEMS KPI SUMMARY */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-md text-[10px] font-black inline-flex items-center justify-center">1</span>
                                    <span>Financial & Traffic Performance Metrics</span>
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-1.5 print-chart-bg">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block">Cumulative Billing</span>
                                        <div className="text-lg font-black text-slate-800 tracking-tight">
                                            {formatAmount(currentRevenue, 'full')}
                                        </div>
                                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded">
                                            +12.5% YoY
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-1.5 print-chart-bg">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block">Monthly Expansion</span>
                                        <div className="text-lg font-black text-slate-800 tracking-tight">
                                            +{currentGrowth}%
                                        </div>
                                        <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded">
                                            +1.5% MoM
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-1.5 print-chart-bg">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block">Active Contracts</span>
                                        <div className="text-lg font-black text-slate-800 tracking-tight">
                                            {totalActiveClients}
                                        </div>
                                        <span className="text-[9px] text-slate-450 font-bold block">
                                            {activeBusinessCount} enterprise contracts
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-1.5 print-chart-bg">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block">Portfolio Health</span>
                                        <div className="text-lg font-black text-slate-800 tracking-tight">
                                            {projectCompletionRate}%
                                        </div>
                                        <span className="text-[9px] text-emerald-700 font-extrabold block">
                                            {completedProjectsCount} of {totalProjects} completed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. ANALYTICAL CHARTS REPAIR RE-PRESENTATION */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-md text-[10px] font-black inline-flex items-center justify-center">2</span>
                                    <span>Analytical Chart Matrix Syntheses</span>
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    {/* CHART 1: MONTHLY EVALUATIONS GROWTH */}
                                    <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span>Company Growth (Monthly Evaluations)</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Trailing 6 Months</span>
                                        </h4>
                                        <div className="space-y-3.5">
                                            {dashboardData.growthData.map((g) => (
                                                <div key={g.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-slate-500">{g.name}</span>
                                                        <span className="font-mono text-slate-800">{g.value}</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden relative border border-slate-200/20">
                                                        <div className="bg-indigo-650 h-full rounded-r-md transition-all duration-350 print-chart-bg" style={{ width: `${Math.min(100, (g.value / 1200) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CHART 2: WEEKLY PERFORMANCE */}
                                    <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span>Weekly Work Performance (Velocity)</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Sprint points</span>
                                        </h4>
                                        <div className="space-y-3.5">
                                            {dashboardData.lineData.map((l) => (
                                                <div key={l.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-slate-500">{l.name}</span>
                                                        <span className="font-mono text-slate-800">{l.value} points</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden relative border border-slate-200/20">
                                                        <div className="bg-violet-600 h-full rounded-r-md transition-all duration-350 print-chart-bg" style={{ width: `${Math.min(100, (l.value / 600) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CHART 3: REVENUE BY TYPE */}
                                    <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span>Internal Division Segment Revenue Share</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Total active divisions</span>
                                        </h4>
                                        <div className="space-y-3.5">
                                            {dashboardData.revenueDistribution.map((r) => {
                                                const percent = totalProjects > 0 ? Math.round((r.value / totalProjects) * 100) : 0;
                                                return (
                                                    <div key={r.name} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-slate-500">{r.name}</span>
                                                            <span className="font-mono text-slate-850 font-black">{r.value} lines ({percent}%)</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden relative border border-slate-200/20">
                                                            <div className="bg-sky-500 h-full rounded-r-md transition-all duration-350 print-chart-bg" style={{ width: `${percent}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* CHART 4: CLIENT DEMOGRAPHICS */}
                                    <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span>Global Clients Territorial Demographics</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Host location contracts</span>
                                        </h4>
                                        <div className="space-y-3.5">
                                            {dashboardData.clientDemographics.map((c) => {
                                                const percent = totalActiveClients > 0 ? Math.round((c.value / totalActiveClients) * 100) : 0;
                                                return (
                                                    <div key={c.name} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-slate-500">{c.name || 'Global'}</span>
                                                            <span className="font-mono text-slate-850 font-black">{c.value} client accounts ({percent}%)</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden relative border border-slate-200/20">
                                                            <div className="bg-teal-500 h-full rounded-r-md transition-all duration-350 print-chart-bg" style={{ width: `${percent}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. ACTIVE PROJECT STATUSES TABLE SUMMARY */}
                            <div className="space-y-3">
                                <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-md text-[10px] font-black inline-flex items-center justify-center">3</span>
                                    <span>Current Project Portfolio Status Ledger</span>
                                </h3>
                                
                                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                    <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider print-chart-bg">
                                            <tr>
                                                <th className="px-4 py-3">Project / Type</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3">Milestone Progress</th>
                                                <th className="px-4 py-3">Technology Stack Tags</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {projects.map((project) => {
                                                const progress = getProjectProgress(project);
                                                const techStack = project.technologies || project.features || ['AI Solution'];
                                                return (
                                                    <tr key={project.id} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-slate-900">{project.title}</div>
                                                            <div className="text-[10px] text-slate-450 font-semibold">{project.client || 'Kestrel Product Internal'} • <span className="capitalize text-slate-500 font-bold">{project.type}</span></div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-center ${
                                                                project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                                project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                                project.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                                'bg-slate-100 text-slate-605'
                                                            }`}>
                                                                {project.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800">
                                                                <span className="w-8 inline-block">{progress}%</span>
                                                                <div className="w-16 h-2 bg-slate-100 rounded-sm overflow-hidden relative inline-block">
                                                                    <div className="bg-indigo-650 h-full rounded-r-sm transition-all duration-300 print-chart-bg" style={{ width: `${progress}%` }} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {techStack.slice(0, 3).map((t, idx) => (
                                                                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9.5px] whitespace-nowrap">{t}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 4. DISPATCHED INCIDENT/HEALTH WARNINGS CENTRE */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-md text-[10px] font-black inline-flex items-center justify-center">4</span>
                                    <span>Project Status Warnings & Logs Register</span>
                                </h3>
                                
                                <div className="space-y-3.5">
                                    {projectAlerts.length > 0 ? (
                                        projectAlerts.map((alert) => {
                                            let borderCol = 'border-l-blue-500';
                                            let textCol = 'text-blue-700';
                                            let bgCol = 'bg-blue-50/10';
                                            if (alert.type === 'critical') {
                                                borderCol = 'border-l-rose-500';
                                                textCol = 'text-rose-700';
                                                bgCol = 'bg-rose-50/10';
                                            } else if (alert.type === 'warning') {
                                                borderCol = 'border-l-amber-500';
                                                textCol = 'text-amber-700';
                                                bgCol = 'bg-amber-50/10';
                                            } else if (alert.type === 'success') {
                                                borderCol = 'border-l-emerald-500';
                                                textCol = 'text-emerald-700';
                                                bgCol = 'bg-emerald-50/10';
                                            }
                                            return (
                                                <div key={alert.id} className={`p-4 border border-slate-200 rounded-xl border-l-4 ${borderCol} ${bgCol} flex items-start gap-4 print-chart-bg`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <span className="text-xs font-black text-slate-800">{alert.projectTitle}</span>
                                                            <span className="font-mono text-[9px] text-slate-400 font-bold">{alert.timestamp}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{alert.message}</p>
                                                        <div className="mt-1.5 flex items-center gap-2.5">
                                                            {alert.milestoneName && (
                                                                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[8.5px] font-black uppercase px-2 py-0.5 rounded">Milestone: {alert.milestoneName}</span>
                                                            )}
                                                            <span className={`text-[9px] font-extrabold uppercase ${textCol}`}>● {alert.resolved ? 'RESOLVED' : 'ACTIVE IN PROGRESS'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-450 text-xs font-semibold">
                                            No incident alerts recorded in this baseline window.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Sign-off area */}
                            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-12 text-slate-400 font-semibold text-[10px]">
                                <div className="space-y-1">
                                    <div>AUTHENTICATION SIGNATURE BASE: <span className="font-mono text-slate-600 font-extrabold">SECURE_SHA_9F2183BA2E</span></div>
                                    <div>CONFIDENTIAL DISCLOSURE SUMMARY © 2026 KESTREL AI SOLUTIONS</div>
                                </div>
                                <div className="text-left sm:text-right space-y-1">
                                    <div>AUDITED BY SYSTEMS GATEWAY NODE ADMIN</div>
                                    <div className="font-mono text-indigo-650 font-bold">https://ai.studio/build/dashboard</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
