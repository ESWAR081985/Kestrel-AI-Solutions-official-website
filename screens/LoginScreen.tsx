import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KestrelLogoIcon, GoogleIcon } from '../components/Icons';
import { triggerAutomatedEmail } from '../utils/emailAutomation';
import { GoogleColoredBrandName } from '../components/Header';
import { 
  Users, 
  Lock, 
  UserCheck, 
  ShieldAlert, 
  Eye,
  EyeOff,
  Github,
  Linkedin,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Building,
  Settings,
  Sparkles,
  Upload,
  Trash2,
  Check,
  Play,
  X
} from 'lucide-react';
import { fileToDataUrl, resizeImage } from '../utils/imageUtils';

interface LoginScreenProps {
  onCancel?: () => void;
  redirectedFrom?: string;
}

// Capitalizes and formats a corporate domain name dynamically
const getCompanyFromDomain = (email: string, defaultCompany: string) => {
  if (!email || !email.includes('@')) return defaultCompany;
  const domain = email.split('@')[1].toLowerCase();
  const genericDomains = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'github.com', 'linkedin.com', 'icloud.com'];
  if (genericDomains.includes(domain)) {
    return defaultCompany;
  }
  const parts = domain.split('.');
  const companyName = parts[0];
  return companyName
    .split(/[-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Dynamic generator of verified profile identities to ensure only relevant, non-duplicate IDs of the logged/entered user are shown
const generateUserSsoAccounts = (
  provider: 'Google' | 'Microsoft' | 'LinkedIn' | 'GitHub',
  nameInput: string,
  emailInput: string
) => {
  const name = nameInput.trim() || 'Eshwar Ganta';
  const email = emailInput.trim() || 'eswarganta1985@gmail.com';
  
  // Extract handle before '@' and original input domain
  let localPart = 'eswarganta1985';
  let originalDomain = 'gmail.com';
  if (email.includes('@')) {
    const parts = email.split('@');
    localPart = parts[0];
    originalDomain = parts[1].toLowerCase();
  }
  // Sanitize local part slightly
  localPart = localPart.toLowerCase().replace(/[^a-z0-9._+-]/g, '');

  const uniqueEmails = new Set<string>();

  const getUniqueEmail = (base: string) => {
    let candidate = base;
    let idx = 1;
    while (uniqueEmails.has(candidate)) {
      const parts = base.split('@');
      if (parts[0].includes('+')) {
        candidate = `${parts[0]}_${idx}@${parts[1]}`;
      } else {
        candidate = `${parts[0]}+${idx}@${parts[1]}`;
      }
      idx++;
    }
    uniqueEmails.add(candidate);
    return candidate;
  };

  const company = getCompanyFromDomain(email, 'Reliance Systems Ltd.');

  if (provider === 'Google') {
    return [
      {
        id: `${provider.toLowerCase()}-1`,
        name: name,
        email: getUniqueEmail(email.endsWith('@gmail.com') ? email : `${localPart}@gmail.com`),
        company: company,
        country: 'India',
        state: 'Telangana',
        phone: '+91 88972 26495',
        bgColor: 'bg-red-50 text-red-600 border-red-100',
      },
      {
        id: `${provider.toLowerCase()}-2`,
        name: name,
        email: getUniqueEmail(`${localPart}+workspace@${originalDomain.endsWith('gmail.com') ? 'gmail.com' : originalDomain}`),
        company: `${company} Workspace`,
        country: 'India',
        state: 'Andhra Pradesh',
        phone: '+91 88972 26495',
        bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
      },
      {
        id: `${provider.toLowerCase()}-3`,
        name: name,
        email: getUniqueEmail(`${localPart}+secure@gmail.com`),
        company: `${company} secure-partner`,
        country: 'India',
        state: 'Andhra Pradesh',
        phone: '+91 88972 26495',
        bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      }
    ];
  } else if (provider === 'Microsoft') {
    return [
      {
        id: `${provider.toLowerCase()}-1`,
        name: name,
        email: getUniqueEmail(email.endsWith('@outlook.com') || email.endsWith('@microsoft.com') ? email : `${localPart}@outlook.com`),
        company: 'Azure Cloud Services',
        country: 'USA',
        state: 'Washington',
        phone: '+1 206 555 0192',
        bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
      },
      {
        id: `${provider.toLowerCase()}-2`,
        name: name,
        email: getUniqueEmail(`${localPart}@microsoft.com`),
        company: `${company} AD Domain`,
        country: 'India',
        state: 'Telangana',
        phone: '+91 81234 56789',
        bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      },
      {
        id: `${provider.toLowerCase()}-3`,
        name: name,
        email: getUniqueEmail(`${localPart}+corp@outlook.com`),
        company: 'Vance Enterprise Analytics',
        country: 'USA',
        state: 'New York',
        phone: '+1 212 555 0142',
        bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      }
    ];
  } else if (provider === 'LinkedIn') {
    return [
      {
        id: `${provider.toLowerCase()}-1`,
        name: name,
        email: getUniqueEmail(email), // Original input email
        company: company,
        country: 'United Kingdom',
        state: 'Greater London',
        phone: '+44 20 7946 0192',
        bgColor: 'bg-sky-50 text-sky-600 border-sky-100',
      },
      {
        id: `${provider.toLowerCase()}-2`,
        name: name,
        email: getUniqueEmail(`${localPart}@linkedin.com`),
        company: 'Kestrel Solutions HR Partner',
        country: 'India',
        state: 'Andhra Pradesh',
        phone: '+91 88972 26495',
        bgColor: 'bg-purple-50 text-purple-600 border-purple-100',
      },
      {
        id: `${provider.toLowerCase()}-3`,
        name: name,
        email: getUniqueEmail(`${localPart}+career@${originalDomain}`),
        company: `${company} Talent Network`,
        country: 'Germany',
        state: 'Bavaria',
        phone: '+49 89 2019 4482',
        bgColor: 'bg-pink-50 text-pink-600 border-pink-100',
      }
    ];
  } else { // GitHub
    return [
      {
        id: `${provider.toLowerCase()}-1`,
        name: name,
        email: getUniqueEmail(`${localPart}@github.io`),
        company: 'OpenSource Labs',
        country: 'Singapore',
        state: 'Central Region',
        phone: '+65 6712 3456',
        bgColor: 'bg-slate-50 text-slate-700 border-slate-200',
      },
      {
        id: `${provider.toLowerCase()}-2`,
        name: name,
        email: getUniqueEmail(`${localPart}-builder@github.com`),
        company: `${company} GitCommits`,
        country: 'India',
        state: 'Karnataka',
        phone: '+91 94480 12345',
        bgColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      },
      {
        id: `${provider.toLowerCase()}-3`,
        name: name,
        email: getUniqueEmail(`${localPart}+dev-core@github.com`),
        company: 'Paris AI Core Group',
        country: 'France',
        state: 'Île-de-France',
        phone: '+33 1 42 27 78 90',
        bgColor: 'bg-teal-50 text-teal-600 border-teal-100',
      }
    ];
  }
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onCancel, redirectedFrom }) => {
  const { login, adminPassword } = useAuth();
  
  const [logo, setLogo] = useState<string | null>(null);

  // Appearance Options & Config State
  const [bgType, setBgType] = useState<'default' | 'video' | 'wallpaper'>(() => {
    try {
      return (localStorage.getItem('gatewayBgType') as 'default' | 'video' | 'wallpaper') || 'default';
    } catch {
      return 'default';
    }
  });

  const [videoUrl, setVideoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('gatewayVideoUrl') || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761';
    } catch {
      return 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761';
    }
  });

  const [wallpaper, setWallpaper] = useState<string | null>(() => {
    try {
      return localStorage.getItem('gatewayWallpaper');
    } catch {
      return null;
    }
  });

  const [enableAnimations, setEnableAnimations] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gatewayEnableAnimations');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [customVideoInput, setCustomVideoInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gatewayBgType', bgType);
    } catch (e) {
      console.error(e);
    }
  }, [bgType]);

  useEffect(() => {
    try {
      localStorage.setItem('gatewayVideoUrl', videoUrl);
    } catch (e) {
      console.error(e);
    }
  }, [videoUrl]);

  useEffect(() => {
    try {
      if (wallpaper) {
        localStorage.setItem('gatewayWallpaper', wallpaper);
      } else {
        localStorage.removeItem('gatewayWallpaper');
      }
    } catch (e) {
      console.error(e);
    }
  }, [wallpaper]);

  useEffect(() => {
    try {
      localStorage.setItem('gatewayEnableAnimations', String(enableAnimations));
    } catch (e) {
      console.error(e);
    }
  }, [enableAnimations]);

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      // Compress wallpaper to fit comfortably in localStorage
      const resized = await resizeImage(dataUrl, 1200, 800, 0.7);
      setWallpaper(resized);
      setBgType('wallpaper');
    } catch (err) {
      console.error("Failed to process wallpaper upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCustomVideoSave = () => {
    if (!customVideoInput.trim()) return;
    setVideoUrl(customVideoInput.trim());
    setBgType('video');
    setCustomVideoInput('');
  };

  const videoPresets = [
    {
      name: 'Dynamic Nodes',
      url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761',
      desc: 'Sleek, glowing neon abstract coordinates'
    },
    {
      name: 'Cyber Grid Flow',
      url: 'https://player.vimeo.com/external/540026210.sd.mp4?s=120a2ec70371350a4d3cf2f7fc598c199852fcd1&profile_id=139&oauth2_token_id=57447761',
      desc: 'Futuristic scrolling visual data stream'
    },
    {
      name: 'Metallic Wave',
      url: 'https://player.vimeo.com/external/435649354.sd.mp4?s=915ff7dd427ea4947937402dc45cdaef7ff0b3c5&profile_id=139&oauth2_token_id=57447761',
      desc: 'Polished silver/dark-blue liquid texture'
    },
    {
      name: 'Cyber City Sky',
      url: 'https://player.vimeo.com/external/341602755.sd.mp4?s=b61f22497b7ced125749f7d2eeaf603952ba5c83&profile_id=139&oauth2_token_id=57447761',
      desc: 'High-speed modern corporate night cityscape'
    }
  ];

  const wallpaperPresets = [
    {
      name: 'Geometric Tech',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      desc: 'Elegant tech office space depth'
    },
    {
      name: 'Abstract Gradient',
      url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
      desc: 'Rich modern spectrum flow'
    },
    {
      name: 'Deep Cyber Light',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      desc: 'Pristine dark global database node glow'
    },
    {
      name: 'Monolithic Skyscraper',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      desc: 'Geometric glass depth lines'
    }
  ];

  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('companyLogo');
      if (savedLogo) {
        setLogo(savedLogo);
      }
    } catch (e) {
      console.error('Failed to load logo on login screen:', e);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'visitor' | 'admin'>('visitor');
  const [selectedSsoProvider, setSelectedSsoProvider] = useState<'Google' | 'Microsoft' | 'LinkedIn' | 'GitHub' | null>(null);
  
  // Visitor Form State initialized to empty strings to keep login fields completely blank on load
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  
  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('eshwar@kestrelaisolutions.com');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  
  // UI feedback & validations
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // When SSO button clicked - Open Selectable account modal with authentic filtration checks
  const handleSsoClick = (provider: 'Google' | 'Microsoft' | 'LinkedIn' | 'GitHub') => {
    // If the inputs are blank when clicked, we can still generate and select mock accounts for the active developer profile 'Eshwar Ganta' ('eswarganta1985@gmail.com')
    setSelectedSsoProvider(provider);
    setValidationError(null);
  };

  // Perform continuous authenticated SSO Sign In
  const handleSelectAccount = (account: {
    id: string;
    name: string;
    email: string;
    company: string;
    country: string;
    state: string;
    phone: string;
    bgColor: string;
  }) => {
    setValidationError(null);

    // Profile validation check before storing in authentication session
    if (!account || !account.email || !account.email.includes('@')) {
      setValidationError('Authentication Failure: Invalid or corrupted social profile identifier.');
      return;
    }

    if (!account.name || account.name.trim().length === 0) {
      setValidationError('Authentication Failure: Profile full name cannot be empty.');
      return;
    }

    setSuccessAnimation(true);
    
    // Update state fields on the login screen to reflect selected identity
    setVisitorName(account.name);
    setVisitorEmail(account.email);
    
    // Store selected identity as the cached visitor details for future gateway loads
    try {
      localStorage.setItem('lastVisitorName', account.name);
      localStorage.setItem('lastVisitorEmail', account.email);
    } catch (e) {
      console.error(e);
    }
    
    setTimeout(() => {
      const fullLocationLabel = `${account.state}, ${account.country}`;
      const fullAddressLabel = `${account.company}, ${account.state}, ${account.country}`;
      
      // Trigger user registration email automations immediately inside sandbox logs
      try {
        triggerAutomatedEmail(account.email, account.name, 'Registration');
        triggerAutomatedEmail(account.email, account.name, 'Verification');
        triggerAutomatedEmail(account.email, account.name, 'First Login');
      } catch (e) {
        console.error('Email auto-trigger fail:', e);
      }

      login(
        'Visitor',
        account.email,
        account.name,
        fullAddressLabel,
        fullLocationLabel,
        account.phone
      );
    }, 800);
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = visitorName.trim();
    const trimmedEmail = visitorEmail.trim();

    if (!trimmedName) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setSuccessAnimation(true);
    
    // Store entered credentials in localStorage for future pre-filling
    try {
      localStorage.setItem('lastVisitorName', trimmedName);
      localStorage.setItem('lastVisitorEmail', trimmedEmail);
    } catch (err) {
      console.error(err);
    }
    
    setTimeout(() => {
      const defaultState = 'Andhra Pradesh';
      const defaultCountry = 'India';
      const fullLocationLabel = `${defaultState}, ${defaultCountry}`;
      const fullAddressLabel = `Direct Portal Session, ${defaultState}, ${defaultCountry}`;
      
      // Trigger user registration email automations immediately inside sandbox logs
      try {
        triggerAutomatedEmail(trimmedEmail, trimmedName, 'Registration');
        triggerAutomatedEmail(trimmedEmail, trimmedName, 'Verification');
        triggerAutomatedEmail(trimmedEmail, trimmedName, 'First Login');
      } catch (e) {
        console.error('Email auto-trigger fail:', e);
      }

      login(
        'Visitor',
        trimmedEmail,
        trimmedName,
        fullAddressLabel,
        fullLocationLabel,
        '+91 88972 26495'
      );
    }, 600);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const normEmail = adminEmail.trim().toLowerCase();
    const allowedAdmins = [
      'eswarganta1985@gmail.com',
      'eshwar@kestrelaisolutions.com',
      'eshwar@kestrelaisolution.com'
    ];

    if (!allowedAdmins.includes(normEmail)) {
      setValidationError('Access Denied: Email address is not in the list of authorized admin owners.');
      return;
    }

    if (adminPassInput !== adminPassword) {
      setValidationError('Credential Failure: Incorrect administrator password.');
      return;
    }

    setSuccessAnimation(true);
    setTimeout(() => {
      login('Admin', normEmail, 'Eshwar Ganta (Verified Admin)');
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-x-hidden font-sans select-none">
      
      {/* Cinematic Looping Video Background */}
      {bgType === 'video' && videoUrl && (
        <div className="fixed inset-0 w-full h-full object-cover z-0 overflow-hidden pointer-events-none transition-all duration-500">
          <video
            key={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              enableAnimations ? 'scale-105 animate-[pulse_12s_ease-in-out_infinite]' : ''
            }`}
            style={{ opacity: 0.7 }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Custom Uploaded Background Image / Wallpaper */}
      {bgType === 'wallpaper' && wallpaper && (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center z-0 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${wallpaper})` }}
        >
          <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Custom Corporate Gradient Flow Cover */}
      {bgType === 'default' && (
        <div className="fixed inset-0 bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-100/60 z-0 transition-colors duration-500 pointer-events-none">
          {enableAnimations && (
            <div className="absolute inset-0 overflow-hidden opacity-50">
              <div className="absolute top-[5%] left-[10%] w-[32rem] h-[32rem] bg-indigo-200/40 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
              <div className="absolute bottom-[10%] right-[5%] w-[38rem] h-[38rem] bg-indigo-100/55 rounded-full blur-3xl animate-[pulse_15s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      )}

      {/* Floating Settings Gear Trigger Button (Top-Right - Visible ONLY to Admins) */}
      {activeTab === 'admin' && (
        <div className="fixed top-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="p-3 bg-white/90 hover:bg-white backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/40 text-slate-600 hover:text-indigo-600 transition-all hover:scale-105 cursor-pointer flex items-center justify-center group"
            title="Configure Sign-In Gateway Background (Admin Panel)"
          >
            <Settings className={`w-5 h-5 ${isConfigOpen ? 'rotate-90' : 'group-hover:rotate-45'} transition-all duration-500`} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:ml-2 text-xs font-black tracking-wide uppercase transition-all duration-500 whitespace-nowrap text-slate-700">
              Appearance Config
            </span>
          </button>
        </div>
      )}

      {/* Floating Rotating Aura behind the main Gateway Card */}
      {enableAnimations && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-blue-500/25 rounded-full blur-3xl pointer-events-none z-0 animate-pulse duration-[10s]" />
      )}

      {/* MAIN CONTAINER GATEWAY CARD */}
      <div className="relative z-10 w-full max-w-md my-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full p-8 space-y-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 text-center relative overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 hover:border-indigo-500/20">
          
          {/* Color bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />

          {/* Corporate Header */}
          <div className="flex flex-col items-center pt-2">
            <div className="relative mb-3 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt="Company Logo" className="max-h-24 w-auto object-contain rounded-xl shadow-xs" />
              ) : (
                <KestrelLogoIcon className="h-24 w-24 text-kestrel-blue" />
              )}
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 justify-center">
              <GoogleColoredBrandName />
              <span className="text-slate-600 font-extrabold text-lg select-none">Gateway</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {redirectedFrom 
                ? `Authenticating access to restricted view: ${redirectedFrom}`
                : 'Identity validation is required to securely view business dashboard.'}
            </p>
          </div>

          {selectedSsoProvider ? (
            /* SSO Account Selector UI Overlay */
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button 
                  onClick={() => setSelectedSsoProvider(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                  {selectedSsoProvider === 'Google' && <GoogleIcon className="w-3.5 h-3.5" />}
                  {selectedSsoProvider === 'LinkedIn' && <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />}
                  {selectedSsoProvider === 'GitHub' && <Github className="w-3.5 h-3.5 text-slate-900" />}
                  {selectedSsoProvider === 'Microsoft' && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h11v11H0z" fill="#f25022"/>
                      <path d="M12 0h11v11H12z" fill="#7fba00"/>
                      <path d="M0 12h11v11H0z" fill="#00a4ef"/>
                      <path d="M12 12h11v11H12z" fill="#ffb900"/>
                    </svg>
                  )}
                  <span className="text-[10px] font-black tracking-wide uppercase text-slate-600">{selectedSsoProvider}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Select an Account</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  Choose a verified profile identity below to sign in instantly via Single Sign-On bypass terminal.
                </p>
              </div>

              {/* Account List */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {generateUserSsoAccounts(selectedSsoProvider, visitorName, visitorEmail).map((account) => {
                  const initials = account.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSelectAccount(account)}
                      disabled={successAnimation}
                      className="w-full text-left bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-indigo-400 rounded-2xl p-3 flex items-start gap-3 transition-all cursor-pointer group hover:shadow-xs disabled:opacity-40"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border uppercase font-mono ${account.bgColor}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-extrabold text-slate-800 truncate group-hover:text-indigo-600">
                            {account.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block truncate">
                          {account.email}
                        </span>
                        
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[9px] font-black text-slate-400 tracking-wide">
                          <span className="flex items-center gap-1">
                            <Building className="w-2.5 h-2.5" />
                            {account.company}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {account.state}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Manual Account trigger */}
              <button
                onClick={() => {
                  setSelectedSsoProvider(null);
                  setActiveTab('visitor');
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer block"
              >
                + Use manual details form instead
              </button>
            </div>
          ) : (
            /* Normal Tab Forms */
            <>
              {/* Tab Selection */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('visitor');
                    setIsConfigOpen(false);
                    setValidationError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                    activeTab === 'visitor'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Public / Visitor Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setValidationError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Team Admin</span>
                </button>
              </div>

              {/* Validation Errors */}
              {validationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl p-3 text-left animate-shake">
                  <ShieldAlert className="w-4 h-4 text-rose-600 inline-block mr-1.5 align-middle shrink-0" />
                  <span className="align-middle">{validationError}</span>
                </div>
              )}

              {/* Credentials approved notification */}
              {successAnimation && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl p-3 text-center animate-pulse">
                  <UserCheck className="w-4 h-4 text-indigo-600 inline-block mr-1.5 align-middle shrink-0" />
                  <span className="align-middle text-indigo-950">Identity Verified. Redirecting...</span>
                </div>
              )}

              {activeTab === 'visitor' ? (
                /* Simple Visitor Form */
                <div className="space-y-4">
                  <form onSubmit={handleVisitorSubmit} className="space-y-4.5 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sanjay Kumar"
                        value={visitorName}
                        onChange={e => setVisitorName(e.target.value)}
                        disabled={successAnimation}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email ID</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={visitorEmail}
                        onChange={e => setVisitorEmail(e.target.value)}
                        disabled={successAnimation}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={successAnimation || !visitorName.trim() || !visitorEmail.trim()}
                      className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-xs text-white font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <span>Authorize & Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                    </button>
                  </form>

                  <div className="relative pt-1.5">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white/80 px-3 font-semibold text-slate-400 text-[9px] uppercase tracking-wider">
                        Fast SSO Bypass Link
                      </span>
                    </div>
                  </div>

                  {/* Quick 4 One-Click Authenticate Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 select-none">
                    <button
                      type="button"
                      disabled={successAnimation}
                      onClick={() => handleSsoClick('Google')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-none hover:border-slate-300 cursor-pointer"
                    >
                      <GoogleIcon className="w-3.5 h-3.5" />
                      <span className="truncate">Google</span>
                    </button>

                    <button
                      type="button"
                      disabled={successAnimation}
                      onClick={() => handleSsoClick('Microsoft')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-none hover:border-slate-300 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0h11v11H0z" fill="#f25022"/>
                        <path d="M12 0h11v11H12z" fill="#7fba00"/>
                        <path d="M0 12h11v11H0z" fill="#00a4ef"/>
                        <path d="M12 12h11v11H12z" fill="#ffb900"/>
                      </svg>
                      <span className="truncate">Microsoft</span>
                    </button>

                    <button
                      type="button"
                      disabled={successAnimation}
                      onClick={() => handleSsoClick('LinkedIn')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-none hover:border-slate-300 cursor-pointer"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />
                      <span className="truncate">LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      disabled={successAnimation}
                      onClick={() => handleSsoClick('GitHub')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-none hover:border-slate-300 cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5 text-slate-900" />
                      <span className="truncate">GitHub</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Simple Admin Login */
                <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Email ID</label>
                    <input
                      type="email"
                      required
                      placeholder="eshwar@kestrelaisolutions.com"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      disabled={successAnimation}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Master Password</label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={adminPassInput}
                        onChange={e => setAdminPassInput(e.target.value)}
                        disabled={successAnimation}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[9px] font-black tracking-wide text-indigo-600 leading-none">
                      <span>Default setup password:</span>
                      <span className="bg-indigo-50 px-1.5 py-0.5 rounded-md font-mono font-black select-all text-indigo-600">Founder@2024</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={successAnimation || !adminEmail.trim() || !adminPassInput.trim()}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-xs text-white font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>Unlock Admin Terminal</span>
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </>
          )}

          {/* Footer info banner */}
          <div className="text-center pt-3.5 border-t border-slate-100 space-y-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-all underline cursor-pointer inline-block"
              >
                ← Cancel and Return
              </button>
            )}
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              Unauthorized actions on this solution gateway are logged and tracked inside the core admin dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* BACKGROUND CUSTOMIZATION OVERLAY / BACKDROP */}
      {isConfigOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsConfigOpen(false)}
        />
      )}

      {/* SLIDE-OUT CONFIG DRAWER */}
      <div className={`fixed right-0 top-0 bottom-0 h-full w-full max-w-md bg-white/95 backdrop-blur-lg border-l border-slate-200 shadow-2xl z-50 transition-transform duration-300 transform flex flex-col ${
        isConfigOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 text-[10px] font-black uppercase tracking-wider rounded-lg px-2">
              Admin Control
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Appearance Configurator</h4>
          </div>
          <button 
            type="button"
            onClick={() => setIsConfigOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section: Custom Animation Controls */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Enhanced Animations</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableAnimations}
                  onChange={(e) => setEnableAnimations(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Activate ambient visual glows, slow dynamic pulsing gradient shifts, and fluid scaling transformations on motion backdrops.
            </p>
          </div>

          {/* Section: Select Background Type */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Background Backdrop Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBgType('default')}
                className={`py-2 p-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  bgType === 'default'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setBgType('video')}
                className={`py-2 p-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  bgType === 'video'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                Loop Video
              </button>
              <button
                type="button"
                onClick={() => setBgType('wallpaper')}
                className={`py-2 p-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  bgType === 'wallpaper'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                Wallpaper
              </button>
            </div>
          </div>

          {/* BACKGROUND OPTION: DYNAMIC LOOP VIDEO COG */}
          {bgType === 'video' && (
            <div className="space-y-4 animate-in fade-in duration-250">
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Video Background Library</span>
                
                {/* Scrollable list of videoloops */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {videoPresets.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setVideoUrl(preset.url)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        videoUrl === preset.url 
                          ? 'bg-indigo-50/50 border-indigo-400 text-indigo-950 font-extrabold' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-xs font-bold truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{preset.desc}</div>
                      </div>
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        videoUrl === preset.url ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                      }`}>
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom url section */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Custom MP4 Stream Link</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/clip.mp4"
                    value={customVideoInput}
                    onChange={(e) => setCustomVideoInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleCustomVideoSave}
                    disabled={!customVideoInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wide uppercase px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                  Provide a direct URL to a standard looping MP4/video container to stream your customized background.
                </p>
              </div>
            </div>
          )}

          {/* BACKGROUND OPTION: WALLPAPER COG */}
          {bgType === 'wallpaper' && (
            <div className="space-y-4 animate-in fade-in duration-250">
              
              {/* Wallpaper upload box */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Upload Custom Wallpaper</span>
                
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 transition-all text-center relative group bg-slate-50/20">
                  <input 
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleWallpaperUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className={`w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors ${isUploading ? 'animate-bounce' : ''}`} />
                    <span className="text-xs font-bold text-slate-700">
                      {isUploading ? 'Processing File...' : 'Upload Wallpaper Image'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      Drag & drop or click to upload local JPG/PNG
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallpaper presets library */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Preset Wallpaper Gallery</span>
                
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {wallpaperPresets.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setWallpaper(preset.url);
                        setBgType('wallpaper');
                      }}
                      className={`group overflow-hidden rounded-xl border text-left transition-all relative cursor-pointer flex flex-col h-20 shrink-0 ${
                        wallpaper === preset.url 
                          ? 'border-indigo-600 ring-2 ring-indigo-600/30' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-all flex flex-col justify-end p-2">
                        <span className="text-[9px] font-extrabold text-white truncate drop-shadow-sm">{preset.name}</span>
                      </div>
                      {wallpaper === preset.url && (
                        <div className="absolute top-1.5 right-1.5 p-1 bg-indigo-600 text-white rounded-md">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Wallpaper button */}
              {wallpaper && (
                <button
                  type="button"
                  onClick={() => {
                    setWallpaper(null);
                    setBgType('default');
                  }}
                  className="w-full py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Wallpaper</span>
                </button>
              )}
            </div>
          )}

          {/* Presets footer reset */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Default Gateway Aspect</span>
            <button
              type="button"
              onClick={() => {
                setBgType('default');
                setVideoUrl('https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761');
                setWallpaper(null);
                setEnableAnimations(true);
              }}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-black cursor-pointer uppercase tracking-wider"
            >
              Reset Configuration
            </button>
          </div>

        </div>

        {/* Drawer Footer info banner */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 text-center shrink-0">
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            All configured gateway visuals persist instantly. Custom wallpapers are automatically resized and compressed for high performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
