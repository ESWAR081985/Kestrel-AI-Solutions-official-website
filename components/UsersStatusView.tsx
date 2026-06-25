import React, { useState, useMemo } from 'react';
import { ViewerLog, ProjectViewerLog, Project } from '../types';
import { 
  Users, 
  Globe, 
  Activity, 
  MapPin, 
  Search, 
  Mail, 
  Laptop, 
  Smartphone, 
  Compass, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  ExternalLink,
  Cpu, 
  Layers, 
  Info, 
  Clock,
  BarChart3
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface UsersStatusViewProps {
  projects: Project[];
  viewerLogs: ViewerLog[];
  projectViewerLogs: ProjectViewerLog[];
  onAddViewerLog: (log: ViewerLog) => void;
  onAddProjectViewerLog: (log: ProjectViewerLog) => void;
  onResetLogs: () => void;
}

export const UsersStatusView: React.FC<UsersStatusViewProps> = ({
  projects,
  viewerLogs,
  projectViewerLogs,
  onAddViewerLog,
  onAddProjectViewerLog,
  onResetLogs
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'project'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(() => {
    return viewerLogs.length > 0 ? viewerLogs[0].id : null;
  });
  const [selectedProjectLogId, setSelectedProjectLogId] = useState<string | null>(() => {
    return projectViewerLogs.length > 0 ? projectViewerLogs[0].id : null;
  });
  const [isGoogleMapMode, setIsGoogleMapMode] = useState<boolean>(true); // Google Map Embed vs SVG Interactive Radar
  const [filterRegion, setFilterRegion] = useState<string>('All');

  // Find currently selected viewer configuration for the Map Viewport
  const selectedViewerInfo = useMemo(() => {
    // If we're looking at project tab, we can prioritize project logs
    if (activeTab === 'project' && selectedProjectLogId) {
      const pLog = projectViewerLogs.find(l => l.id === selectedProjectLogId);
      if (pLog) {
        return {
          email: pLog.email,
          country: pLog.country,
          state: pLog.state,
          areaAddress: pLog.areaAddress,
          latitude: pLog.latitude,
          longitude: pLog.longitude,
          device: pLog.device,
          timestamp: pLog.timestamp,
          context: `Interacted: ${pLog.action} (${pLog.projectTitle})`,
          isProject: true
        };
      }
    }

    // Default to selected generic viewer log
    if (selectedLogId) {
      const vLog = viewerLogs.find(l => l.id === selectedLogId);
      if (vLog) {
        return {
          email: vLog.email,
          country: vLog.country,
          state: vLog.state,
          areaAddress: vLog.areaAddress,
          latitude: vLog.latitude,
          longitude: vLog.longitude,
          device: vLog.device,
          timestamp: vLog.timestamp,
          context: `Visiting: ${vLog.pageVisited}`,
          isProject: false
        };
      }
    }

    // Fallback info
    return viewerLogs.length > 0 ? {
      email: viewerLogs[0].email,
      country: viewerLogs[0].country,
      state: viewerLogs[0].state,
      areaAddress: viewerLogs[0].areaAddress,
      latitude: viewerLogs[0].latitude,
      longitude: viewerLogs[0].longitude,
      device: viewerLogs[0].device,
      timestamp: viewerLogs[0].timestamp,
      context: `Visiting: ${viewerLogs[0].pageVisited}`,
      isProject: false
    } : {
      email: 'eswarganta1985@gmail.com',
      country: 'India',
      state: 'Andhra Pradesh',
      areaAddress: 'Gnanapuram, Visakhapatnam Space Park',
      latitude: 17.72,
      longitude: 83.29,
      device: 'Desktop Chrome',
      timestamp: new Date().toLocaleTimeString(),
      context: 'Initial Location Anchor',
      isProject: false
    };
  }, [viewerLogs, projectViewerLogs, selectedLogId, selectedProjectLogId, activeTab]);

  // List of unique regions/countries for filter dropdown
  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    viewerLogs.forEach(v => countries.add(v.country));
    projectViewerLogs.forEach(p => countries.add(p.country));
    return ['All', ...Array.from(countries)];
  }, [viewerLogs, projectViewerLogs]);

  // Country-wise data aggregation for Website Viewers
  const webViewerCountryData = useMemo(() => {
    const counts: Record<string, number> = {};
    viewerLogs.forEach(log => {
      counts[log.country] = (counts[log.country] || 0) + 1;
    });
    return Object.entries(counts).map(([country, count]) => ({
      country,
      "Sessions": count,
    })).sort((a, b) => b["Sessions"] - a["Sessions"]);
  }, [viewerLogs]);

  // Country-wise data aggregation for Project Viewers
  const projectViewerCountryData = useMemo(() => {
    const counts: Record<string, number> = {};
    projectViewerLogs.forEach(log => {
      counts[log.country] = (counts[log.country] || 0) + 1;
    });
    return Object.entries(counts).map(([country, count]) => ({
      country,
      "Inspections": count,
    })).sort((a, b) => b["Inspections"] - a["Inspections"]);
  }, [projectViewerLogs]);

  // Scaler to fit global latitudes and longitudes safely into radar scanning coordinates
  const getRadarPosition = (lat: number, lng: number) => {
    // Limits covering US West coast to Australia East Coast and South America to Northern Europe/Siberia
    const minLng = -130;
    const maxLng = 160;
    const minLat = -42;
    const maxLat = 68;

    const leftRaw = ((lng - minLng) / (maxLng - minLng)) * 100;
    const topRaw = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);

    // Keep dots comfortably away from the borders for superior radar layout focus
    const left = Math.min(Math.max(10, leftRaw), 90);
    const top = Math.min(Math.max(10, topRaw), 90);

    return { left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` };
  };

  // Filtered views based on search matches
  const filteredWebLogs = useMemo(() => {
    return viewerLogs.filter(v => {
      const matchSearch = 
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.areaAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.pageVisited.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchRegion = filterRegion === 'All' || v.country === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [viewerLogs, searchQuery, filterRegion]);

  const filteredProjectLogs = useMemo(() => {
    return projectViewerLogs.filter(p => {
      const matchSearch = 
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.areaAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRegion = filterRegion === 'All' || p.country === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [projectViewerLogs, searchQuery, filterRegion]);

  // Generate lists of mock users, states, cities for random simulation
  const simulateNewViewer = () => {
    const emails = [
      'director@cloudaisolutions.com',
      'lead.architect@techstars.io',
      'growth.manager@kestrels.in',
      'deeplearning_adv@gmail.com',
      'sanjay.sharma@reliancecorp.com',
      'priya_naidu88@yahoo.com',
      'james.smith@apexai.co.uk',
      'li_wei@vibrantnest.com.sg',
      'sarah.connor@cyberdyne.org',
      'aravind.k@finanztech.co'
    ];
    const citiesInIndia = [
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lng: 83.2185 },
      { city: 'Guntur', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365 },
      { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
      { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
      { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
      { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 }
    ];
    const globalCities = [
      { city: 'San Jose', state: 'California', country: 'USA', lat: 37.3382, lng: -121.8863 },
      { city: 'London', state: 'Greater London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
      { city: 'Singapore', state: 'Central Region', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { city: 'Sydney', state: 'New South Wales', country: 'Australia', lat: -33.8688, lng: 151.2093 }
    ];

    const isIndia = Math.random() > 0.4;
    const locationList = isIndia ? citiesInIndia : globalCities;
    const location = locationList[Math.floor(Math.random() * locationList.length)];
    const email = emails[Math.floor(Math.random() * emails.length)];
    const randSuffix = Math.floor(Math.random() * 900 + 100);
    const randomizedEmail = email.includes('@') ? email.split('@')[0] + randSuffix + '@' + email.split('@')[1] : 'visitor' + randSuffix + '@kestrelai.com';

    const devices = ['Desktop Window 11', 'MacBook Pro macOS', 'iPhone 15 Pro Max iOS', 'Android Google Pixel 8'];
    const browsers = ['Chrome Browser v126', 'Safari Intelligent Engine', 'Firefox Quantum', 'Edge Secure AI Shell'];
    const pages = ['Home Feed', 'Kestrel Omnichannel Media Center', 'Leaderboard Analytics', 'AI Solutions Catalog', 'Finance Ledger'];

    const newLog: ViewerLog = {
      id: 'viewer_' + Date.now(),
      email: randomizedEmail,
      country: location.country,
      state: location.state,
      areaAddress: `${location.city}, Near Technology Hub`,
      latitude: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
      longitude: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4)),
      timestamp: new Date().toLocaleTimeString(),
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      pageVisited: pages[Math.floor(Math.random() * pages.length)],
      viewDurationMs: Math.floor(Math.random() * 45000 + 5000)
    };

    onAddViewerLog(newLog);
    setSelectedLogId(newLog.id);
  };

  const simulateProjectInteraction = () => {
    if (projects.length === 0) return;

    const globalCities = [
      { city: 'Visakhapatnam Cyber Valley', state: 'Andhra Pradesh', country: 'India', lat: 17.72, lng: 83.29 },
      { city: 'Vijayawada Capital', state: 'Andhra Pradesh', country: 'India', lat: 16.5062, lng: 80.6480 },
      { city: 'Tirupati AI Cloud Lab', state: 'Andhra Pradesh', country: 'India', lat: 13.6288, lng: 79.4192 },
      { city: 'New York Financial HQ', state: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { city: 'Austin Tech Center', state: 'Texas', country: 'USA', lat: 30.2672, lng: -97.7431 }
    ];

    const project = projects[Math.floor(Math.random() * projects.length)];
    const location = globalCities[Math.floor(Math.random() * globalCities.length)];
    const randSuffix = Math.floor(Math.random() * 800 + 100);
    const email = `evaluator.${randSuffix}@venturepartners.com`;
    const actions: ('Viewed Demo' | 'Opened Repo' | 'Inspected Milestones' | 'Shared Configuration')[] = [
      'Viewed Demo',
      'Opened Repo',
      'Inspected Milestones',
      'Shared Configuration'
    ];

    const newProjectLog: ProjectViewerLog = {
      id: 'proj_viewer_' + Date.now(),
      email,
      projectId: project.id,
      projectTitle: project.title,
      country: location.country,
      state: location.state,
      areaAddress: location.city,
      latitude: parseFloat((location.lat + (Math.random() - 0.5) * 0.03).toFixed(4)),
      longitude: parseFloat((location.lng + (Math.random() - 0.5) * 0.03).toFixed(4)),
      timestamp: new Date().toLocaleTimeString(),
      device: Math.random() > 0.5 ? 'Desktop Space Terminal' : 'Smart Handheld Android 14',
      action: actions[Math.floor(Math.random() * actions.length)]
    };

    onAddProjectViewerLog(newProjectLog);
    setSelectedProjectLogId(newProjectLog.id);
  };

  // Safe Google Maps link & output embed query
  const googleMapsQuery = useMemo(() => {
    const encodedAddress = encodeURIComponent(`${selectedViewerInfo.areaAddress}, ${selectedViewerInfo.state}, ${selectedViewerInfo.country}`);
    return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }, [selectedViewerInfo]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-kestrel-blue" />
            <span>Kestrel AI Users & Viewer Status Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Realtime metrics tracking website visits, active demo inspections, geographic location analysis, and project evaluations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={simulateNewViewer}
            className="inline-flex items-center gap-1.5 bg-[#14B8A6] hover:bg-[#0D9488] text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Web Viewer</span>
          </button>
          
          <button
            onClick={simulateProjectInteraction}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Simulate Project Action</span>
          </button>

          <button
            onClick={onResetLogs}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
            title="Reset system back to initial master list"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Logs</span>
          </button>
        </div>
      </div>

      {/* Analytics widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Total Guest Visits</span>
            <div className="text-lg font-black text-slate-900">{viewerLogs.length} Sessions</div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Incrementing dynamically</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Project Inspections</span>
            <div className="text-lg font-black text-slate-900">{projectViewerLogs.length} Events</div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Repository / Demo hits</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Top Location</span>
            <div className="text-lg font-black text-slate-900 truncate max-w-[155px]">Andhra Pradesh, IN</div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Visakhapatnam Hub Center</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Avg Session Duration</span>
            <div className="text-lg font-black text-slate-900">4.8 Minutes</div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Excellent developer retention</p>
          </div>
        </div>
      </div>

      {/* Primary Split View: Left Map Viewport, Right Active Profile Detail card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAP SECTOR (2/3 size) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  Live Terminal GIS Map Viewport
                </h3>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                  Centering on: <span className="text-amber-400 font-semibold">{selectedViewerInfo.areaAddress}</span> ({selectedViewerInfo.latitude}, {selectedViewerInfo.longitude})
                </p>
              </div>
            </div>
            
            {/* Toggle maps selection */}
            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg select-none">
              <button
                onClick={() => setIsGoogleMapMode(true)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  isGoogleMapMode 
                    ? 'bg-blue-600 text-white shadow-sm font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Maps Embed
              </button>
              <button
                onClick={() => setIsGoogleMapMode(false)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  !isGoogleMapMode 
                    ? 'bg-blue-600 text-white shadow-sm font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mock GPS Radar
              </button>
            </div>
          </div>

          {/* Map Frame wrapper with CF2 guard: explicit height constraint */}
          <div className="aspect-video w-full h-[320px] sm:h-[380px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800/80">
            {isGoogleMapMode ? (
              <iframe
                id="viewer-geographic-google-map"
                title="Google Map Viewer Location"
                className="w-full h-full border-none shadow-inner"
                src={googleMapsQuery}
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              /* Custom Elegant Mock Vector Radar Screen */
              <div className="w-full h-full relative cursor-crosshair select-none flex items-center justify-center overflow-hidden bg-slate-950">
                
                {/* Neon circular radar lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-24 h-24 rounded-full border border-[#14B8A6] animate-ping" />
                  <div className="w-48 h-48 rounded-full border border-dashed border-[#14B8A6]/80" />
                  <div className="w-80 h-80 rounded-full border border-dashed border-[#14B8A6]/60" />
                  <div className="w-[450px] h-[450px] rounded-full border border-[#14B8A6]/40" />
                </div>

                {/* Radar sweeping rotative arm */}
                <div className="absolute w-[500px] h-[500px] origin-center rounded-full pointer-events-none animate-spin-radar opacity-25 bg-[conic-gradient(from_0deg,transparent_70%,rgba(20,184,166,0.3)_100%)]" />

                {/* Grid UI Labels */}
                <div className="absolute top-3 left-4 font-mono text-[9px] text-[#14B8A6] tracking-wider space-y-0.5">
                  <div>LAT_REF: {selectedViewerInfo.latitude}° N</div>
                  <div>LNG_REF: {selectedViewerInfo.longitude}° E</div>
                  <div>AZIMUTH: 182.17° SW</div>
                  <div className="text-amber-500 font-bold text-[8px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    TARGET SECURED
                  </div>
                </div>

                <div className="absolute bottom-3 right-4 font-mono text-[8px] text-slate-500 uppercase tracking-widest text-right">
                  <div>SCANNING SECTOR 09-AP</div>
                  <div>KESTREL OMNI TELEMETRY</div>
                </div>

                {/* Center Core Ping Indicator */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.8)] border-2 border-white animate-bounce">
                    <MapPin className="w-3 h-3 text-slate-900 fill-slate-900" />
                  </div>
                  <div className="mt-2 bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-md text-center max-w-[200px] shadow-2xl backdrop-blur-xs">
                    <div className="text-[10px] font-black text-amber-400 truncate">{selectedViewerInfo.email}</div>
                    <div className="text-[9px] font-bold text-white mt-0.5">{selectedViewerInfo.areaAddress}</div>
                  </div>
                </div>

                {/* Dynamically Projected Filtered Web Visitor Logs */}
                {filteredWebLogs.map((v) => {
                  const pos = getRadarPosition(v.latitude, v.longitude);
                  const isSelected = selectedViewerInfo.email === v.email && !selectedViewerInfo.isProject;
                  return (
                    <div
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLogId(v.id);
                      }}
                      className="absolute group z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-130"
                      style={{ left: pos.left, top: pos.top }}
                    >
                      {/* Pulsing halo */}
                      <span className={`absolute inline-flex h-4.5 w-4.5 rounded-full opacity-65 animate-ping -left-1.5 -top-1.5 ${
                        isSelected ? 'bg-amber-400' : 'bg-[#14B8A6]'
                      }`} />
                      
                      {/* Active core point */}
                      <div className={`h-2.5 w-2.5 rounded-full border border-white shadow-md ${
                        isSelected ? 'bg-amber-500 ring-2 ring-amber-300 scale-135' : 'bg-[#14B8A6]'
                      }`} />

                      {/* Hover Info Card / Tooltip */}
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg shadow-xl text-[10px] w-48 z-40 backdrop-blur-xs pointer-events-none text-left">
                        <div className="font-extrabold text-[#14B8A6] truncate">{v.email}</div>
                        <div className="text-slate-200 mt-1 whitespace-normal font-medium leading-tight">{v.areaAddress}, {v.country}</div>
                        <div className="text-slate-400 font-mono mt-0.5 truncate text-[9.5px]">Visits: {v.pageVisited}</div>
                        <div className="text-[9px] text-[#14B8A6] animate-pulse font-extrabold mt-1">CLICK TO LOCK TARGET</div>
                      </div>
                    </div>
                  );
                })}

                {/* Dynamically Projected Filtered Project Engagement Logs */}
                {filteredProjectLogs.map((p) => {
                  const pos = getRadarPosition(p.latitude, p.longitude);
                  const isSelected = selectedViewerInfo.email === p.email && selectedViewerInfo.isProject;
                  return (
                    <div
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectLogId(p.id);
                      }}
                      className="absolute group z-25 cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-130"
                      style={{ left: pos.left, top: pos.top }}
                    >
                      {/* Pulsing halo */}
                      <span className={`absolute inline-flex h-4.5 w-4.5 rounded-full opacity-65 animate-ping -left-1.5 -top-1.5 ${
                        isSelected ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      
                      {/* Active core point */}
                      <div className={`h-2.5 w-2.5 rounded-full border border-white shadow-md ${
                        isSelected ? 'bg-amber-400 ring-2 ring-amber-300 scale-135' : 'bg-blue-500'
                      }`} />

                      {/* Hover Info Card / Tooltip */}
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg shadow-xl text-[10px] w-48 z-40 backdrop-blur-xs pointer-events-none text-left font-sans">
                        <div className="font-extrabold text-blue-400 truncate">{p.email}</div>
                        <div className="text-slate-200 mt-1 whitespace-normal font-medium leading-tight">{p.areaAddress} ({p.country})</div>
                        <div className="text-amber-400 font-bold mt-0.5 truncate animate-pulse font-semibold">Action: {p.action}</div>
                        <div className="text-[9px] text-amber-500 animate-pulse font-bold mt-1">CLICK TO LOCK TARGET</div>
                      </div>
                    </div>
                  );
                })}

                {/* Dynamic Telemetry Active Pin Map Ends */}
              </div>
            )}
            
            {/* Warning banner detailing API configuration if they want it */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-start gap-2 backdrop-blur-xs">
              <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-350 leading-normal">
                <strong>Google Maps Setup note:</strong> This map is loaded dynamically using a lightweight query parameters sandbox frame. 
                Excellent for viewing properties without loading heavy JavaScript SDK wrappers or requiring instant paid authentication bills.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIVE PROFILE DETAIL PANEL (1/3 size) */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-150">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Target Inspection Profile
                </h3>
                <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                  Inspecting live location metrics
                </p>
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">Login Email ID</span>
                <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate" title={selectedViewerInfo.email}>{selectedViewerInfo.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">Area Address</span>
                <div className="text-xs font-semibold text-slate-700 flex items-start gap-1.5 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{selectedViewerInfo.areaAddress}, {selectedViewerInfo.state}, {selectedViewerInfo.country}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-widest">Country</span>
                  <p className="text-xs font-bold text-slate-800">{selectedViewerInfo.country}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-widest">State</span>
                  <p className="text-xs font-bold text-slate-800">{selectedViewerInfo.state}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-widest">Latitude</span>
                  <code className="text-xs font-mono font-bold text-[#14B8A6]">{selectedViewerInfo.latitude}° N</code>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-widest">Longitude</span>
                  <code className="text-xs font-mono font-bold text-[#14B8A6]">{selectedViewerInfo.longitude}° E</code>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">System Context</span>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
                  <div className="mt-0.5 text-slate-600">
                    {selectedViewerInfo.isProject ? <Cpu className="w-4 h-4 text-blue-500" /> : <Layers className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="text-[11px] leading-snug text-slate-600">
                    <span className="font-bold text-slate-800 capitalize">{selectedViewerInfo.isProject ? 'Project evaluation event:' : 'Active navigation view:'}</span>
                    <p className="text-slate-500 font-medium mt-0.5">{selectedViewerInfo.context}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">Client Hardware Device</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
                  {selectedViewerInfo.device.toLowerCase().includes('phone') || selectedViewerInfo.device.toLowerCase().includes('handheld') ? (
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{selectedViewerInfo.device}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedViewerInfo.areaAddress + ', ' + selectedViewerInfo.state + ', ' + selectedViewerInfo.country)}`}
              target="_blank" 
              rel="noreferrer referrer" 
              className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs font-black border border-blue-150 transition-colors"
            >
              <span>View in Google Maps App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Geographic Distribution Bar Charts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Web Viewers Chart Card */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Website Viewers by Country
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Total guest session counts grouped geographically
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {webViewerCountryData.map((d, idx) => (
                    <span key={idx} className="inline-flex items-center bg-teal-50/55 border border-teal-100/50 text-slate-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                      {d.country}: <span className="text-teal-600 ml-0.5 font-black">{d.Sessions}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="bg-[#14B8A6]/10 text-[#0D9488] font-black text-[10px] px-2.5 py-0.5 rounded-full border border-[#14B8A6]/20">
              {viewerLogs.length} Sessions
            </span>
          </div>

          <div className="h-[220px] w-full">
            {webViewerCountryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={webViewerCountryData}
                  margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="country" 
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="Sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                    {webViewerCountryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#0D9488' : '#14B8A6'} />
                    ))}
                    <LabelList dataKey="Sessions" position="top" fill="#0D9488" fontSize={10} fontWeight={800} />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No session data available
              </div>
            )}
          </div>
        </div>

        {/* Project Viewers Action Distribution */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Project Evaluations by Country
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Developer actions and inspections counts
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {projectViewerCountryData.map((d, idx) => (
                    <span key={idx} className="inline-flex items-center bg-blue-50/55 border border-blue-100/50 text-slate-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                      {d.country}: <span className="text-blue-600 ml-0.5 font-black">{d.Inspections}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="bg-blue-50 text-blue-700 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-blue-100">
              {projectViewerLogs.length} Inspections
            </span>
          </div>

          <div className="h-[220px] w-full">
            {projectViewerCountryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={projectViewerCountryData}
                  margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="country" 
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="Inspections" name="Inspections" radius={[4, 4, 0, 0]}>
                    {projectViewerCountryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#1D4ED8' : '#3B82F6'} />
                    ))}
                    <LabelList dataKey="Inspections" position="top" fill="#1D4ED8" fontSize={10} fontWeight={800} />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No evaluation action data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Filters & Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        
        {/* Search header container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-5">
          {/* Navigation sub-tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
            <button
              onClick={() => {
                setActiveTab('all');
                // Select first matching
                if (viewerLogs.length > 0) setSelectedLogId(viewerLogs[0].id);
              }}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Activity Records ({viewerLogs.length + projectViewerLogs.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('web');
                if (viewerLogs.length > 0) setSelectedLogId(viewerLogs[0].id);
              }}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                activeTab === 'web' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Website Viewers ({viewerLogs.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('project');
                if (projectViewerLogs.length > 0) setSelectedProjectLogId(projectViewerLogs[0].id);
              }}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                activeTab === 'project' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Projects Viewers ({projectViewerLogs.length})
            </button>
          </div>

          {/* Filtering row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Email ID, location, state..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-slate-350 focus:ring-1 focus:ring-slate-300 rounded-xl text-xs font-semibold text-slate-800 w-full md:w-64 outline-hidden shadow-xs transition-colors"
              />
            </div>

            {/* Region dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Filter Country:</span>
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="bg-white border border-slate-200 px-2.5 py-2.5 text-xs font-bold text-slate-700 outline-hidden rounded-xl focus:border-slate-350 transition-colors"
              >
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Display of Tables */}
        {activeTab !== 'project' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
              <span>Website Viewers Active Sessions Logs</span>
            </h4>
            
            <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-xs">
              <table className="min-w-full divide-y divide-slate-150 text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px] font-black">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-left">Viewer Login Email ID</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Country / State</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Area Address Location</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Coordinates</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Device Info</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Visited Section</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredWebLogs.length > 0 ? (
                    filteredWebLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedLogId(log.id)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          selectedLogId === log.id 
                            ? 'bg-amber-50/40 hover:bg-amber-50/50 border-l-2 border-amber-500' 
                            : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 truncate max-w-[190px]" title={log.email}>
                            {log.email}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <div className="text-slate-800 font-bold">{log.country}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{log.state}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-slate-600 line-clamp-1 max-w-[180px]" title={log.areaAddress}>
                            {log.areaAddress}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono text-[10px] text-[#14B8A6] font-bold">
                          {log.latitude.toFixed(3)}, {log.longitude.toFixed(3)}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-500">
                          <div className="flex items-center gap-1">
                            {log.device.toLowerCase().includes('phone') ? <Smartphone className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                            <span className="text-[10px]">{log.device}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {log.pageVisited}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-slate-450 font-mono text-[10px]">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                        No website viewer logs match your filtering parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab !== 'web' && (
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 block animate-pulse" />
              <span>Developer Project Viewers Evaluation Logs</span>
            </h4>
            
            <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-xs">
              <table className="min-w-full divide-y divide-slate-150 text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px] font-black">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-left">Email Address (ID)</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Project Evaluated</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Action Triggered</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Country / State</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Area Address</th>
                    <th scope="col" className="px-5 py-3.5 text-center">GPS Coordinates</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredProjectLogs.length > 0 ? (
                    filteredProjectLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedProjectLogId(log.id)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          selectedProjectLogId === log.id 
                            ? 'bg-blue-50/40 hover:bg-blue-50/50 border-l-2 border-blue-500' 
                            : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 truncate max-w-[190px]" title={log.email}>
                            {log.email}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-800 line-clamp-1 max-w-[160px]" title={log.projectTitle}>
                            {log.projectTitle}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.action === 'Viewed Demo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            log.action === 'Opened Repo' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            log.action === 'Inspected Milestones' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-slate-800 font-bold">{log.country}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">{log.state}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 truncate max-w-[140px]" title={log.areaAddress}>
                          {log.areaAddress}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono text-[10px] text-blue-600 font-bold">
                          {log.latitude.toFixed(3)}, {log.longitude.toFixed(3)}
                        </td>
                        <td className="px-5 py-3.5 text-center text-slate-450 font-mono text-[10px]">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                        No project evaluation records correspond to selected metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
