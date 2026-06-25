import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Calculator, 
  Mail, 
  Bot, 
  TrendingUp, 
  Truck, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Send, 
  Receipt,
  ArrowRight,
  Check,
  RefreshCw,
  SearchCode,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../contexts/CurrencyContext';

interface CustomerRequest {
  id: string;
  trackingId: string;
  clientName: string;
  companyName: string;
  email: string;
  baseProduct: string;
  monthlyQueries: string;
  integrationType: string;
  supportTier: string;
  securityPolicies: string[];
  estimatedCost: number;
  additionalDetails: string;
  timestamp: string;
  status: 'Draft' | 'Under Architect Review' | 'Feasibility Complete' | 'Quote Dispatched' | 'Active Project';
}

const PRODUCTS_CATALOG = [
  {
    id: 'chatbot',
    name: 'Kestrel Chatbot Nexus',
    category: 'Natural Language Processing',
    icon: Bot,
    description: 'Deploy a brilliant generative customer-agent. Supports full semantic context matching, intent parsing, and instant CRM handoff.',
    basePrice: 999,
    features: ['Custom Prompt Tuner', 'CRM Platform APIs', 'Sentiment & Intent Analytics'],
    startingSpecs: 'Up to 50k chats/month included'
  },
  {
    id: 'logistics',
    name: 'Kestrel RouteLogix',
    category: 'Optimization & Logistics',
    icon: Truck,
    description: 'Advanced machine learning engine to solve vehicle routing, grid deliveries, and supply chain constraints in real-time.',
    basePrice: 2499,
    features: ['Dynamic Traffic Recalculation', 'Multi-depot Constraint Solver', 'Fleet Dashboard SDK'],
    startingSpecs: 'Up to 1,000 active routes/month'
  },
  {
    id: 'predictor',
    name: 'Kestrel Predictor AI',
    category: 'Business Forecasts',
    icon: TrendingUp,
    description: 'High-fidelity multivariate time-series forecast engine. Ingests ERP historicals to predict future order demand and sales velocities.',
    basePrice: 1499,
    features: ['95% Statistical Confidence intervals', 'Anomaly Correction Engine', 'Automated Database Webhooks'],
    startingSpecs: 'Analyzes up to 5M sales records'
  },
  {
    id: 'rag_search',
    name: 'Kestrel RAG Knowledge',
    category: 'Generative Knowledge Search',
    icon: SearchCode,
    description: 'Secure indexing of enterprise manuals, wikis, and cloud file-stores. Instantly queries files via a private custom retrieval pipeline.',
    basePrice: 3999,
    features: ['Vector Embedding Store', 'Metadata Filtering Policies', 'Strict Enterprise Role Access Control'],
    startingSpecs: 'Supports safe processing of up to 50,000 documents'
  }
];

export const CustomerPortalView: React.FC = () => {
  const { activeCurrency, setCurrencyByCode, formatAmount } = useCurrency();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const formatPortalPrice = (priceInUsd: number) => {
    return formatAmount(priceInUsd * 83.5);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currencyRef]);

  // Navigation & filtering in the catalog
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom Estimator Form State
  const [activeBaseProduct, setActiveBaseProduct] = useState<string>('chatbot');
  const [workloadQueries, setWorkloadQueries] = useState<number>(100000); // Slider values: 10,000 to 5,000,000
  const [integrationType, setIntegrationType] = useState<string>('cloud'); // cloud, hybrid, standalone
  const [supportTier, setSupportTier] = useState<string>('business'); // standard, business, enterprise
  const [securityHardening, setSecurityHardening] = useState<{
    encryption: boolean;
    hipaaCompliance: boolean;
    failover: boolean;
  }>({
    encryption: true,
    hipaaCompliance: false,
    failover: false
  });

  // RFQ Submission form fields
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Requests Tracker list
  const [myRequests, setMyRequests] = useState<CustomerRequest[]>([]);

  // Load requests on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kestrelCustomerOrders');
      if (saved) {
        setMyRequests(JSON.parse(saved));
      } else {
        // Seed initial request for standard visitor demo
        const demoRequest: CustomerRequest = {
          id: 'req_demo1',
          trackingId: 'KES-AI-5098',
          clientName: 'Alexander Vance',
          companyName: 'Apex Strategic Ltd',
          email: 'alexander@apex-strategy.com',
          baseProduct: 'chatbot',
          monthlyQueries: '250,000 Queries',
          integrationType: 'cloud',
          supportTier: 'business',
          securityPolicies: ['End-to-End Encryption'],
          estimatedCost: 1548,
          additionalDetails: 'Seeking a customer care system to decrease ticket volumes.',
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleDateString() + ' ' + new Date(Date.now() - 3600000 * 2).toLocaleTimeString(),
          status: 'Under Architect Review'
        };
        setMyRequests([demoRequest]);
        localStorage.setItem('kestrelCustomerOrders', JSON.stringify([demoRequest]));
      }
    } catch (e) {
      console.error('Failed to load customer requests', e);
    }
  }, []);

  // Price Calculation Logic
  const calculateEstimate = () => {
    const selectedProd = PRODUCTS_CATALOG.find(p => p.id === activeBaseProduct);
    const baseCost = selectedProd ? selectedProd.basePrice : 1500;
    
    // Scale cost based on query workload multiplier
    // Base features cover up to 50k. Each additional 100k adds a tier cost.
    let baseCapacityCovered = 50000;
    let overflowMultiplier = 0.0015; // $0.0015 per extra query over covered
    
    if (activeBaseProduct === 'logistics') {
      baseCapacityCovered = 10000;
      overflowMultiplier = 0.0045; // optimization models are computationally heavy
    } else if (activeBaseProduct === 'rag_search') {
      baseCapacityCovered = 20000;
      overflowMultiplier = 0.0060;
    }
    
    const extraQueries = Math.max(0, workloadQueries - baseCapacityCovered);
    const volumePremiumCost = Math.round(extraQueries * overflowMultiplier);

    // Integration pricing additions
    let integrationCost = 0;
    if (integrationType === 'hybrid') integrationCost = 450;
    if (integrationType === 'standalone') integrationCost = 1200;

    // Support tier costs
    let supportCost = 0;
    if (supportTier === 'business') supportCost = 299;
    if (supportTier === 'enterprise') supportCost = 999;

    // Security Hardening costs
    let securityCost = 0;
    if (securityHardening.encryption) securityCost += 150;
    if (securityHardening.hipaaCompliance) securityCost += 450;
    if (securityHardening.failover) securityCost += 250;

    const totalCost = baseCost + volumePremiumCost + integrationCost + supportCost + securityCost;
    return {
      baseCost,
      volumePremiumCost,
      integrationCost,
      supportCost,
      securityCost,
      totalCost
    };
  };

  const currentPricesPlan = calculateEstimate();

  const handleCatalogSelection = (productId: string) => {
    setActiveBaseProduct(productId);
    // Autofocus estimator
    const element = document.getElementById('price-estimator-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmissionSuccess('');

    if (!clientName.trim() || !companyName.trim() || !emailAddress.trim()) {
      setFormError('Please enter your Name, Company, and Email Address to continue.');
      return;
    }

    const compiledPolicies: string[] = [];
    if (securityHardening.encryption) compiledPolicies.push('End-to-End Encryption');
    if (securityHardening.hipaaCompliance) compiledPolicies.push('HIPAA & SOC 2 Vault');
    if (securityHardening.failover) compiledPolicies.push('Failover Recovery');

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRequest: CustomerRequest = {
      id: 'req_' + Math.random().toString(36).substring(2, 9),
      trackingId: `KES-AI-${randomSuffix}`,
      clientName,
      companyName,
      email: emailAddress,
      baseProduct: activeBaseProduct,
      monthlyQueries: `${workloadQueries.toLocaleString()} Workload Cycles`,
      integrationType: integrationType === 'cloud' ? 'Managed Cloud REST' : integrationType === 'hybrid' ? 'Hybrid Local Link' : 'On-Premises Edge Build',
      supportTier: supportTier === 'standard' ? 'SLA Standard Team' : supportTier === 'business' ? 'SLA Dedicated Support (24/7)' : 'Mission-Critical Dedicated SRE',
      securityPolicies: compiledPolicies,
      estimatedCost: currentPricesPlan.totalCost,
      additionalDetails: customDetails,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      status: 'Under Architect Review'
    };

    const updated = [newRequest, ...myRequests];
    setMyRequests(updated);
    localStorage.setItem('kestrelCustomerOrders', JSON.stringify(updated));

    setSubmissionSuccess(`Workspace Blueprint Received! Your Tracking Reference is ${newRequest.trackingId}.`);
    
    // Clear form fields
    setClientName('');
    setCompanyName('');
    setEmailAddress('');
    setCustomDetails('');
  };

  const handleSimulateStatus = (id: string) => {
    const statuses: Array<CustomerRequest['status']> = [
      'Draft', 
      'Under Architect Review', 
      'Feasibility Complete', 
      'Quote Dispatched', 
      'Active Project'
    ];
    
    const updated = myRequests.map(req => {
      if (req.id === id) {
        const currentIndex = statuses.indexOf(req.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return {
          ...req,
          status: statuses[nextIndex]
        };
      }
      return req;
    });

    setMyRequests(updated);
    localStorage.setItem('kestrelCustomerOrders', JSON.stringify(updated));
  };

  const getStatusColor = (status: CustomerRequest['status']) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Under Architect Review': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Feasibility Complete': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Quote Dispatched': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Active Project': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const categories = ['All', 'Natural Language Processing', 'Optimization & Logistics', 'Business Forecasts', 'Generative Knowledge Search'];
  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS_CATALOG 
    : PRODUCTS_CATALOG.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-12 pb-12">
      
      {/* Immersive Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 border border-indigo-950 text-white p-8 md:p-12 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            Public Services Configurator Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Design & Estimate Your Custom <span className="text-indigo-300">Kestrel AI Solution</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
            Browse our standard enterprise models, configure custom operational bounds, calculate budgetary forecasts in real-time, and submit requests directly to our systems engineering team led by Founder Eshwar Ganta.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <a 
              href="#price-estimator" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('price-estimator-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Configure Live Budget
            </a>
            <a 
              href="#active-tracker" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('active-tracker-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              Track Existing Request ({myRequests.length})
            </a>
          </div>
        </div>
      </div>

      {/* Catalog & Filter Navigation */}
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-650" />
              1. Explore Enterprise Software Services
            </h2>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Filter by tech stack or model objective. Select any item to auto-populate the cost estimator below.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* BASE CURRENCY SELECTOR */}
            <div className="relative" ref={currencyRef}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono transition-opacity">
                BASE CURRENCY SELECTOR
              </div>
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl text-slate-705 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                aria-haspopup="true"
                aria-expanded={isCurrencyOpen}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{activeCurrency.label}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: isCurrencyOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden divide-y divide-slate-100 border border-slate-200 animate-in fade-in slide-in-from-top-1">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => {
                          setCurrencyByCode(currency.code);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                          activeCurrency.code === currency.code
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{currency.label}</span>
                        {activeCurrency.code === currency.code && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0 font-extrabold" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono select-none pointer-events-none opacity-0 sm:block hidden">
                FILTER CATEGORIES
              </div>
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat === 'All' ? 'All Modules' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map(product => {
            const IconComponent = product.icon;
            const isSelected = activeBaseProduct === product.id;
            return (
              <div 
                key={product.id}
                className={`relative bg-white rounded-xl shadow-sm border p-6 transition-all duration-300 flex flex-col justify-between ${
                  isSelected 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg translate-y-[-2px]' 
                    : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {product.category}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      From {formatPortalPrice(product.basePrice)}/mo
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0 self-start">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-xs font-medium">
                        {product.startingSpecs}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    {product.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Core Service capabilities</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Standard SLA Included</span>
                  <button
                    onClick={() => handleCatalogSelection(product.id)}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-550 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>Configure Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Estimator & RFQ Form Block */}
      <div id="price-estimator-section" className="scroll-mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Step 2 Form Parameters */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5.5 h-5.5 text-indigo-650" />
              2. Custom Solution Architect
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Define your workload size, deployment rules, and service-level response times.</p>
          </div>

          <div className="space-y-6 border-t border-slate-100 pt-6">
            
            {/* Base Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Selected Base Core System
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRODUCTS_CATALOG.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveBaseProduct(p.id)}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      activeBaseProduct === p.id
                        ? 'bg-indigo-50 border-indigo-550 text-indigo-750 font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {p.name.replace('Kestrel ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Workload Queries Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Operational Volume / Monthly Load
                </label>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                  {workloadQueries >= 1000000 
                    ? `${(workloadQueries / 1000000).toFixed(1)}M cycles` 
                    : `${(workloadQueries / 1000).toFixed(0)}k cycles`}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="3000000"
                step="10000"
                value={workloadQueries}
                onChange={(e) => setWorkloadQueries(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5 mt-1">
                <span>10,000 requests</span>
                <span>1.5M requests</span>
                <span>3.0M requests</span>
              </div>
            </div>

            {/* Data Integration Levels */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Data Integration & Siting Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  integrationType === 'cloud'
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="integration"
                    value="cloud"
                    checked={integrationType === 'cloud'}
                    onChange={() => setIntegrationType('cloud')}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">Fully Cloud-Managed</span>
                    <span className="text-[10px] text-slate-500 leading-normal block mt-1">
                      Kestrel manages container scaling and host compute. Plug in via standard HTTPS REST.
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-650 font-extrabold mt-3 block">Included inside standard</span>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  integrationType === 'hybrid'
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="integration"
                    value="hybrid"
                    checked={integrationType === 'hybrid'}
                    onChange={() => setIntegrationType('hybrid')}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">Hybrid Data Synced</span>
                    <span className="text-[10px] text-slate-500 leading-normal block mt-1">
                      Continuous mirroring of private server data with public endpoint caches. Secure tunnel.
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-650 font-extrabold mt-3 block">+ {formatPortalPrice(450)}/month</span>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  integrationType === 'standalone'
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="integration"
                    value="standalone"
                    checked={integrationType === 'standalone'}
                    onChange={() => setIntegrationType('standalone')}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">On-premise Airgap</span>
                    <span className="text-[10px] text-slate-500 leading-normal block mt-1">
                      Run inside your distinct security perimeter with isolated databases. Zero remote telemetry.
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-650 font-extrabold mt-3 block">+ {formatPortalPrice(1200)}/month</span>
                </label>
              </div>
            </div>

            {/* SLA support level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Service Level Agreement (SLA) Support Tier
                </label>
                <select
                  value={supportTier}
                  onChange={(e) => setSupportTier(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="standard">Standard Level (Next-biz-day email, no fee)</option>
                  <option value="business">{`Business Priority Support (2 hours response, +${formatPortalPrice(299)}/mo)`}</option>
                  <option value="enterprise">{`Mission-Critical Dedicated SRE (30 mins response, +${formatPortalPrice(999)}/mo)`}</option>
                </select>
              </div>

              {/* Security checkbox logic */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  System Hardening & Audit Safeguards
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={securityHardening.encryption}
                      onChange={(e) => setSecurityHardening({...securityHardening, encryption: e.target.checked})}
                      className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500/20 h-4 w-4"
                    />
                    <span>E2E Transit Encryption & Access Logging (+{formatPortalPrice(150)}/mo)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={securityHardening.hipaaCompliance}
                      onChange={(e) => setSecurityHardening({...securityHardening, hipaaCompliance: e.target.checked})}
                      className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500/20 h-4 w-4"
                    />
                    <span>Strict HIPAA / SOC2 Compliance Vault (+{formatPortalPrice(450)}/mo)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={securityHardening.failover}
                      onChange={(e) => setSecurityHardening({...securityHardening, failover: e.target.checked})}
                      className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500/20 h-4 w-4"
                    />
                    <span>Multi-region Failover & Zero-Downtime (+{formatPortalPrice(250)}/mo)</span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Live Quote Summary & Form Submit Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Realtime Estimate Card */}
          <div className="bg-slate-900 text-white rounded-xl shadow-lg border border-slate-950 p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <div className="border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5" />
                Live Quote Calculations
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Estimated ongoing licensing costs based on selection config</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Infrastructure Software Licences:</span>
                <span className="font-mono font-bold">{formatPortalPrice(currentPricesPlan.baseCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Scaled Volumetric Overhead:</span>
                <span className="font-mono font-bold">{formatPortalPrice(currentPricesPlan.volumePremiumCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Database Synced Site Premium:</span>
                <span className="font-mono font-bold">{formatPortalPrice(currentPricesPlan.integrationCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>SLA Support Grade Contract:</span>
                <span className="font-mono font-bold">{formatPortalPrice(currentPricesPlan.supportCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Security Hardening Audited Packs:</span>
                <span className="font-mono font-bold">{formatPortalPrice(currentPricesPlan.securityCost)}</span>
              </div>

              <div className="border-t border-slate-800 my-4 pt-4 flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-wide text-indigo-300">ESTIMATED PRICE</span>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {formatPortalPrice(currentPricesPlan.totalCost)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold">/ MONTHLY</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 text-[10px] text-slate-400 mt-4 leading-relaxed font-semibold">
              ℹ Note: This live budgetary estimate serves as a directional baseline. Submission translates your active configuration parameters into a secure system RFQ request for technical feasibility checks.
            </div>
          </div>

          {/* Submission RFQ Card */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-600" />
              Submit Blueprint to Architect
            </h3>

            {submissionSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold p-3.5 rounded-xl mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-black text-[11px] text-emerald-900">RFQ Blueprints Submitted!</p>
                  <p className="font-medium text-[10px] text-slate-550 leading-normal mt-0.5">{submissionSuccess}</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-bold p-3 rounded-lg mb-4 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    My Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="E.g. Eshwar Ganta"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    My Company name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="E.g. Kestrel AI Inc"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="E.g. contact@business.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Custom Requirements Details
                </label>
                <textarea
                  rows={2}
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  placeholder="Need special plugins, non-disclosure agreements, or developer integrations?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-650 to-indigo-750 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Blueprint RFQ Request</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Requests Tracker Section */}
      <div id="active-tracker-section" className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="w-5.5 h-5.5 text-indigo-650" />
              3. Private Request Tracking Terminal
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Monitor and simulate the lifecycle of your system requests in this sandbox. Double click 'Simulate Status Upgrade' to progress.</p>
          </div>

          <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            Active Records: {myRequests.length} Quotes
          </span>
        </div>

        {myRequests.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-150 rounded-xl">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-bold">No requested custom specs logged in this browser session.</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">Build an interactive blueprint in Section 2 and submit the RFQ above to spawn a live tracking entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Tracking Code & Ref</th>
                  <th className="py-3.5 px-4">Core Model</th>
                  <th className="py-3.5 px-4">Client Detail</th>
                  <th className="py-3.5 px-4">Service Scope / Siting</th>
                  <th className="py-3.5 px-4">Cost Estimate</th>
                  <th className="py-3.5 px-4">Workflow Level</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs font-semibold">
                {myRequests.map(req => {
                  const baseProductObject = PRODUCTS_CATALOG.find(p => p.id === req.baseProduct);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-700 block font-black">{req.trackingId}</span>
                        <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{req.timestamp}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-800 block font-bold">{baseProductObject ? baseProductObject.name : 'Custom Setup'}</span>
                        <span className="text-[10px] text-indigo-500 block font-normal mt-0.5">{req.monthlyQueries}</span>
                      </td>
                      <td className="py-4 px-4 col-span-1 max-w-[150px] truncate">
                        <span className="text-slate-800 block font-bold">{req.clientName}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{req.companyName} ({req.email})</span>
                      </td>
                      <td className="py-4 px-4 text-[11px] leading-relaxed">
                        <span className="text-slate-700 block font-semibold">{req.integrationType}</span>
                        <span className="text-[9.5px] text-slate-400 block font-medium mt-0.5">{req.supportTier}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-emerald-700 font-extrabold text-sm">{formatPortalPrice(req.estimatedCost)}/mo</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider inline-block ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSimulateStatus(req.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold text-[10px] rounded-md transition-all uppercase tracking-wider"
                        >
                          <RefreshCw className="w-3 h-3 text-indigo-650" />
                          <span>Simulate Status Upgrade</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
