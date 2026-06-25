import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Building, 
    User, 
    Compass, 
    Search, 
    Sparkles,
    Grid,
    ChevronRight,
    Cpu
} from 'lucide-react';
import { Client } from '../types';

interface ClientPlacementMapProps {
    clients: { business: Client[]; personal: Client[] };
}

// Coordinate mappings for known countries to position nicely on our custom SVG world viewport
const clientCountryCoordinates: Record<string, { x: number; y: number; lat: number; lng: number; region: string }> = {
    'USA': { x: 22, y: 38, lat: 37.0902, lng: -95.7129, region: 'North America' },
    'India': { x: 72, y: 52, lat: 20.5937, lng: 78.9629, region: 'South Asia' },
    'Germany': { x: 50, y: 30, lat: 51.1657, lng: 10.4515, region: 'Western Europe' },
    'Japan': { x: 86, y: 38, lat: 36.2048, lng: 138.2529, region: 'East Asia' },
    'United Kingdom': { x: 47, y: 28, lat: 55.3781, lng: -3.4360, region: 'Western Europe' },
    'UK': { x: 47, y: 28, lat: 55.3781, lng: -3.4360, region: 'Western Europe' },
    'Canada': { x: 20, y: 28, lat: 56.1304, lng: -106.3468, region: 'North America' },
    'Australia': { x: 86, y: 78, lat: -25.2744, lng: 133.7751, region: 'Oceania' },
    'Singapore': { x: 76, y: 62, lat: 1.3521, lng: 103.8198, region: 'Southeast Asia' },
};

export const ClientPlacementMap: React.FC<ClientPlacementMapProps> = ({ clients }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'all' | 'business' | 'personal'>('all');
    const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null);
    const radarActive = true;

    // Flatten clients and tag them with their specific type (business vs personal)
    const allClientsFlat = useMemo(() => {
        const businessList = (clients.business || []).map(c => ({ ...c, type: 'business' as const, compositeKey: `business-${c.id}` }));
        const personalList = (clients.personal || []).map(c => ({ ...c, type: 'personal' as const, compositeKey: `personal-${c.id}` }));
        return [...businessList, ...personalList];
    }, [clients]);

    // Deterministic position hashing helper for any newly added/custom countries
    const getClientCoords = useMemo(() => {
        return (client: Client) => {
            const country = (client.country || '').trim();
            
            // Check exact case and lowercase fallbacks
            const match = clientCountryCoordinates[country] || 
                          clientCountryCoordinates[Object.keys(clientCountryCoordinates).find(k => k.toLowerCase() === country.toLowerCase()) || ''];
            
            if (match) return match;
            
            // Compute simple deterministic coordinates based on name hash if not matched
            let hash = 0;
            for (let i = 0; i < country.length; i++) {
                hash = country.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            const x = 30 + (Math.abs(hash) % 50); // range 30% to 80%
            const y = 25 + (Math.abs(hash >> 3) % 45); // range 25% to 70%
            const lat = 10 + (Math.abs(hash) % 40);
            const lng = -40 + (Math.abs(hash >> 2) % 120);
            
            return { x, y, lat, lng, region: 'Global Node' };
        };
    }, []);

    // Filters and search logic
    const filteredClients = useMemo(() => {
        return allClientsFlat.filter(client => {
            const matchesTab = 
                selectedTab === 'all' || 
                (selectedTab === 'business' && client.type === 'business') ||
                (selectedTab === 'personal' && client.type === 'personal');
                
            const matchesSearch = 
                client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.industry.toLowerCase().includes(searchQuery.toLowerCase());
                
            return matchesTab && matchesSearch;
        });
    }, [allClientsFlat, selectedTab, searchQuery]);

    // Find the currently selected client object
    const activeClient = useMemo(() => {
        if (selectedClientKey === null) return null;
        return allClientsFlat.find(c => c.compositeKey === selectedClientKey) || null;
    }, [allClientsFlat, selectedClientKey]);

    // Select the first client by default when the component loads
    useEffect(() => {
        if (allClientsFlat.length > 0 && selectedClientKey === null) {
            setSelectedClientKey(allClientsFlat[0].compositeKey);
        }
    }, [allClientsFlat, selectedClientKey]);

    // Clean details for active selected client coordinates
    const activeCoords = activeClient ? getClientCoords(activeClient) : null;

    return (
        <div id="active-clients-placement-card" className="bg-white rounded-xl shadow-lg border border-slate-150 p-6 md:p-8 space-y-6 relative overflow-hidden">
            {/* CARD TITLE & EXPLANATION */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded-xl">
                        <Compass className="w-5 h-5 text-indigo-650 animate-spin-slow" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <span>Client Global Footprint Placement Map</span>
                            <span className="bg-emerald-550/10 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide normal-case">
                                Active Locations Map
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Visualizing live global nodes, business deployment sites, and partner industries plotted on an interactive telemetry radar.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg select-none">
                        {[
                            { id: 'all', label: 'All Clients' },
                            { id: 'business', label: 'Business Only' },
                            { id: 'personal', label: 'Personal Only' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${
                                    selectedTab === tab.id 
                                        ? 'bg-indigo-650 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-800 font-bold'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* LEFT: THE FUTURISTIC RADAR GIS MAP VIEWPORT (2/3 width) */}
                <div className="xl:col-span-2 flex flex-col space-y-3">
                    <div className="aspect-video w-full h-[320px] sm:h-[400px] bg-[#070913] rounded-xl overflow-hidden relative border border-slate-850 shadow-2xl flex items-center justify-center">
                        
                        {/* Futuristic scan grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,48,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,48,0.1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                        
                        {/* Neon circular sonar pulses */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-32 h-32 rounded-full border border-indigo-500 animate-pulse" />
                            <div className="w-64 h-64 rounded-full border border-dashed border-indigo-400" />
                            <div className="w-[450px] h-[450px] rounded-full border border-dashed border-indigo-300" />
                        </div>

                        {/* Radar sweeping green/blue blade */}
                        {radarActive && (
                            <div className="absolute w-[550px] h-[550px] origin-center rounded-full pointer-events-none animate-spin-radar opacity-10 bg-[conic-gradient(from_0deg,transparent_60%,rgba(99,102,241,0.5)_100%)]" />
                        )}

                        {/* STYLIZED SVG CONTINENT BACKDROP */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Stylized Minimal Polygons representing continents */}
                            {/* North America */}
                            <polygon points="10,25 25,18 40,18 36,45 28,52 20,42" fill="#818CF8" />
                            {/* South America */}
                            <polygon points="28,52 38,55 35,70 32,85 28,70" fill="#818CF8" />
                            {/* Europe / Asia */}
                            <polygon points="42,22 55,18 78,16 88,32 75,55 58,58 48,45 42,32" fill="#818CF8" />
                            {/* Africa */}
                            <polygon points="45,45 56,48 58,68 48,72 44,58" fill="#818CF8" />
                            {/* Australia */}
                            <polygon points="80,72 90,75 88,85 80,82" fill="#818CF8" />
                        </svg>

                        {/* Global Map Latitude/Longitude Tick Guidelines */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-indigo-500/10 pointer-events-none" />
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-indigo-500/10 pointer-events-none" />
                        
                        {/* Radar HUD Metrics Overlay */}
                        <div className="absolute top-4 left-4 font-mono text-[9px] text-indigo-400/80 tracking-wider space-y-1 pointer-events-none select-none">
                            <div className="flex items-center gap-1.5">
                                <Cpu className="w-3 h-3 text-indigo-400 animate-pulse" />
                                <span className="font-bold">KESTREL_CLIENT_RADAR // ACTIVE</span>
                            </div>
                            {activeClient && activeCoords && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -5 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    className="text-[8px] space-y-0.5 text-indigo-300"
                                >
                                    <div>TARGET_ID: CLN_00{activeClient.id}</div>
                                    <div>SECTOR_LAT: {activeCoords.lat.toFixed(4)}°</div>
                                    <div>SECTOR_LNG: {activeCoords.lng.toFixed(4)}°</div>
                                    <div>REGION: {activeCoords.region.toUpperCase()}</div>
                                </motion.div>
                            )}
                        </div>

                        <div className="absolute top-4 right-4 font-mono text-[8.5px] text-slate-500 text-right pointer-events-none">
                            <div>CONCURRENT_PL_NODES: {allClientsFlat.length}</div>
                            <div>FILTER_MATCHES: {filteredClients.length}</div>
                        </div>

                        {/* CENTRAL PINPOINT CARD TARGET (Drawn if client selected) */}
                        <AnimatePresence mode="wait">
                            {activeClient && activeCoords && (
                                <motion.div 
                                    key={activeClient.compositeKey}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="absolute z-10 flex flex-col items-center pointer-events-none"
                                    style={{ left: `${activeCoords.x}%`, top: `${activeCoords.y}%` }}
                                >
                                    {/* Bounce pointer pin with nice glowing radar circles */}
                                    <div className="relative -translate-y-6 flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 border-white relative ${
                                            activeClient.type === 'business' 
                                                ? 'bg-indigo-600 shadow-indigo-650/40' 
                                                : 'bg-teal-500 shadow-teal-500/40'
                                        }`}>
                                            {activeClient.type === 'business' ? (
                                                <Building className="w-4 h-4 text-white" />
                                            ) : (
                                                <User className="w-4 h-4 text-white" />
                                            )}
                                            
                                            {/* Ripple pulses */}
                                            <span className={`absolute -inset-2 rounded-full opacity-35 animate-ping ${
                                                activeClient.type === 'business' ? 'bg-indigo-400' : 'bg-teal-400'
                                            }`} />
                                        </div>
                                        {/* Point Arrow */}
                                        <div className="w-2.5 h-2.5 rotate-45 bg-white border-r border-b border-slate-100 -mt-1 shadow-sm" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ALL CLIENT DOT PLOTS */}
                        {filteredClients.map(client => {
                            const coords = getClientCoords(client);
                            const isSelected = selectedClientKey === client.compositeKey;
                            
                            return (
                                <button
                                    key={client.compositeKey}
                                    onClick={() => setSelectedClientKey(client.compositeKey)}
                                    className="absolute group z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-130 focus:outline-none"
                                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                                >
                                    {/* Pulse circle rings */}
                                    <span className={`absolute inline-flex h-6 w-6 rounded-full opacity-40 animate-ping -left-1.5 -top-1.5 ${
                                        client.type === 'business' ? 'bg-indigo-400' : 'bg-teal-400'
                                    }`} />
                                    
                                    {/* Center Dot */}
                                    <div className={`h-3 w-3 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
                                        isSelected 
                                            ? 'bg-amber-400 ring-4 ring-amber-400/35 scale-125' 
                                            : client.type === 'business' 
                                                ? 'bg-indigo-500' 
                                                : 'bg-teal-400'
                                    }`} />

                                    {/* Mini tooltip popup on hover */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg shadow-2xl text-[10.5px] w-44 z-50 pointer-events-none text-left">
                                        <div className="font-extrabold text-indigo-300 truncate">{client.name}</div>
                                        <div className="text-slate-200 mt-0.5 text-[9px] font-bold leading-tight">{client.industry} • {client.country}</div>
                                        <div className="text-[9px] text-indigo-400 font-mono mt-1 flex items-center gap-1">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            <span>CLICK TO HIGHLIGHT</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {/* Interactive compass overlay */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 backdrop-blur-md select-none text-[8.5px] font-mono text-slate-350">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>GIS GRID: ACTIVE_CLIENTS_COORD_MAPPING</span>
                        </div>
                    </div>

                    {/* Bottom active feedback message */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-start gap-2.5">
                        <Cpu className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
                        <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                            Each active client node represents a signed corporate partnership or active consulting license. Hover over pins on the coordinate sonar grid or click elements in the side register to focus on specific nodes.
                        </p>
                    </div>
                </div>

                {/* RIGHT: INTERACTIVE SEARCHABLE LEDGER & INFO EXPANSION (1/3 width) */}
                <div className="flex flex-col justify-between space-y-4">
                    {/* Top Detail Card Panel */}
                    <AnimatePresence mode="wait">
                        {activeClient && activeCoords ? (
                            <motion.div 
                                key={activeClient.compositeKey}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-md space-y-4 flex flex-col justify-between h-[230px]"
                            >
                                <div className="space-y-3.5">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
                                        <div className={`p-2 rounded-xl border flex-shrink-0 ${
                                            activeClient.type === 'business' 
                                                ? 'bg-indigo-50 border-indigo-150 text-indigo-650' 
                                                : 'bg-teal-50 border-teal-150 text-teal-650'
                                        }`}>
                                            {activeClient.type === 'business' ? (
                                                <Building className="w-4 h-4 text-indigo-600" />
                                            ) : (
                                                <User className="w-4 h-4 text-teal-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <span className={`text-[8px] font-black uppercase tracking-wider block ${
                                                activeClient.type === 'business' ? 'text-indigo-600' : 'text-teal-600'
                                            }`}>
                                                {activeClient.type === 'business' ? 'Enterprise Client' : 'Personal Account'}
                                            </span>
                                            <h4 className="text-xs font-black text-slate-800 truncate" title={activeClient.name}>
                                                {activeClient.name}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 font-semibold leading-normal">
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Core Industry</span>
                                            <span className="text-slate-800 font-extrabold truncate block">{activeClient.industry}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Geographic Host</span>
                                            <span className="text-slate-800 font-extrabold truncate block">{activeClient.country}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Target Coordinate</span>
                                            <span className="font-mono text-[9px] text-indigo-600 font-bold block">
                                                {activeCoords.lat.toFixed(2)}°N / {activeCoords.lng.toFixed(2)}°E
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Regional Sector</span>
                                            <span className="text-slate-800 font-extrabold truncate block">{activeCoords.region}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Deployment Status</span>
                                    <span className="text-emerald-600 flex items-center gap-1 font-black">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span>ACTIVE PIPELINE</span>
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-5 h-[230px] flex flex-col items-center justify-center text-center">
                                <Grid className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">No Node Selected</span>
                                <p className="text-[10px] text-slate-400 font-medium max-w-[180px] mt-1 leading-normal">
                                    Click any active client dot or item in the listing to display telemetry profiles.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Ledger Search, filter, and Scrollable List panel */}
                    <div className="space-y-2.5">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search client node..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-250 hover:border-slate-350 focus:border-indigo-500 focus:bg-white text-xs py-2 pl-9 pr-4 rounded-xl outline-none font-semibold transition-all duration-150"
                            />
                        </div>

                        {/* List Items wrapper */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[155px] overflow-y-auto pr-0.5 space-y-0.5 divide-y divide-slate-100 shadow-sm">
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => {
                                    const isSelected = selectedClientKey === client.compositeKey;
                                    return (
                                        <button
                                            key={client.compositeKey}
                                            onClick={() => setSelectedClientKey(client.compositeKey)}
                                            className={`w-full p-2.5 text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-indigo-50/60' 
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-extrabold text-slate-800 text-[11px] truncate block" title={client.name}>
                                                        {client.name}
                                                    </span>
                                                    <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                                                        client.type === 'business' 
                                                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                                                            : 'bg-teal-50 text-teal-600 border border-teal-100'
                                                    }`}>
                                                        {client.type === 'business' ? 'B2B' : 'Ind'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-450 font-bold truncate mt-0.5">
                                                    {client.industry} • <span className="text-slate-500">{client.country}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                                isSelected ? 'text-indigo-650 translate-x-0.5 scale-110' : 'text-slate-300'
                                            }`} />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                                    No client nodes match search query.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
