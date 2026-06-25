import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from '../components/DashboardCard';
import { EditIcon, UserIcon } from '../components/Icons';
import { fetchSimulatedOAuthDetails, OAuthProvider } from '../services/oauthMockService';

// Helper to convert a file to a data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Helper to resize image and convert to a data URL
const resizeImage = (base64Str: string, maxWidth: number, maxHeight: number, quality: number = 0.9): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};


const ssoProfileDirectory = [
  { name: 'Sanjay Kumar', email: 'sanjay.k@gmail.com', company: 'Reliance Systems Ltd.', country: 'India', state: 'Telangana', phone: '+91 88972 26495' },
  { name: 'Eshwar Ganta', email: 'eshwar@kestrelaisolutions.com', company: 'Kestrel AI Solutions', country: 'India', state: 'Andhra Pradesh', phone: '+91 88972 26495', address: 'DNO.10-259, Plot No.16, Visalakshi Nagar, Visakhapatnam, Andhra Pradesh, 530043' },
  { name: 'Eshwar Ganta', email: 'eshwar.g.guest@gmail.com', company: 'Ganta Tech Solutions', country: 'India', state: 'Andhra Pradesh', phone: '+91 99014 55821' },
  { name: 'Ananya Sharma', email: 'ananya.sharma@gmail.com', company: 'Global Retail Ventures', country: 'India', state: 'Maharashtra', phone: '+91 76220 18833' },
  { name: 'Sarah Jenkins', email: 'sarah.j@microsoft.com', company: 'Azure Cloud Services', country: 'USA', state: 'Washington', phone: '+1 206 555 0192' },
  { name: 'Karthik Reddy', email: 'karthik.reddy@hyderabad-ventures.in', company: 'Deccan Tech Funds', country: 'India', state: 'Telangana', phone: '+91 81234 56789' },
  { name: 'William Vance', email: 'w.vance@outlook.com', company: 'Vance Enterprise Analytics', country: 'USA', state: 'New York', phone: '+1 212 555 0142' },
  { name: 'James Smith', email: 'james.smith@apexcorp.com', company: 'Apex AI Partners', country: 'United Kingdom', state: 'Greater London', phone: '+44 20 7946 0192' },
  { name: 'Priya Naidu', email: 'priya.naidu@linkedin.com', company: 'Kestrel Solutions HR Partner', country: 'India', state: 'Andhra Pradesh', phone: '+91 88972 26495' },
  { name: 'Elena Rostova', email: 'elena.rostova@techmatch.eu', company: 'Munich Talent Hub', country: 'Germany', state: 'Bavaria', phone: '+49 89 2019 4482' },
  { name: 'Alex Rivera', email: 'dev_alex@github.io', company: 'OpenSource Labs', country: 'Singapore', state: 'Central Region', phone: '+65 6712 3456' },
  { name: 'Vikram Malhotra', email: 'vikram-builder@github.com', company: 'CodeCrafters International', country: 'India', state: 'Karnataka', phone: '+91 94480 12345' },
  { name: 'Sophie Dubois', email: 'sophie.d@github.com', company: 'Paris AI Core Group', country: 'France', state: 'Île-de-France', phone: '+33 1 4227 7583' }
];

const ProfileScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [picture, setPicture] = useState('');
  
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isFetching, setIsFetching] = useState(false);
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  // Form validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (fields: {
    name: string;
    email: string;
    address: string;
    location: string;
    whatsapp: string;
    jobTitle: string;
    bio: string;
  }) => {
    const newErrors: Record<string, string> = {};

    // Name Validation
    if (!fields.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (fields.name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters long';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fields.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(fields.email.trim())) {
      newErrors.email = 'Enter a valid email layout address (e.g., example@domain.com)';
    }

    // Professional Job Title Validation
    if (!fields.jobTitle.trim()) {
      newErrors.jobTitle = 'Professional job title is required for SSO alignments';
    } else if (fields.jobTitle.trim().length < 2) {
      newErrors.jobTitle = 'Job title must be at least 2 characters';
    }

    // Biography Validation
    if (!fields.bio.trim()) {
      newErrors.bio = 'Profile biography details are required to complete claims description';
    } else if (fields.bio.trim().length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters long to provide sufficient workspace context';
    }

    // Address Validation
    if (!fields.address.trim()) {
      newErrors.address = 'Corporate address details are required';
    }

    // Location Validation
    if (!fields.location.trim()) {
      newErrors.location = 'Geographic city & region is required';
    }

    // WhatsApp Contact links validation
    if (!fields.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp contact link is required';
    } else {
      const phoneRegex = /^\+?[0-9\s\-()]{7,18}$/;
      if (!phoneRegex.test(fields.whatsapp.trim())) {
        newErrors.whatsapp = 'Provide a valid international telephone contact format (e.g. +91 8897226495)';
      }
    }

    return newErrors;
  };

  // Dynamic Live Validation effect
  useEffect(() => {
    const currentErrors = validateForm({ name, email, address, location, whatsapp, jobTitle, bio });
    setErrors(currentErrors);
  }, [name, email, address, location, whatsapp, jobTitle, bio]);

  const shouldShowError = (fieldName: string) => {
    return !!(errors[fieldName] && (touchedFields[fieldName] || formSubmitted));
  };

  // Load draft or user claims on mount
  useEffect(() => {
    if (user) {
      const savedDraft = localStorage.getItem(`kestrelProfileDraft_${user.id}`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setName(parsed.name ?? user.name ?? '');
          setEmail(parsed.email ?? user.email ?? '');
          setAddress(parsed.address ?? user.address ?? '');
          setLocation(parsed.location ?? user.location ?? '');
          setWhatsapp(parsed.whatsapp ?? user.whatsapp ?? '');
          setJobTitle(parsed.jobTitle ?? user.jobTitle ?? '');
          setBio(parsed.bio ?? user.bio ?? '');
          setPicture(parsed.picture ?? user.picture ?? '');
          setDraftStatus('saved');
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      } else {
        setName(user.name || '');
        setEmail(user.email || '');
        setAddress(user.address || '');
        setLocation(user.location || '');
        setWhatsapp(user.whatsapp || '');
        setJobTitle(user.jobTitle || '');
        setBio(user.bio || '');
        setPicture(user.picture || '');
        setDraftStatus('idle');
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-700">User not found.</h2>
        <p className="text-slate-500 mt-2">Please try logging in again.</p>
      </div>
    );
  }

  // Handle auto-saving on each input change
  const saveDraft = (updated: { 
    name?: string; 
    email?: string; 
    address?: string; 
    location?: string; 
    whatsapp?: string;
    jobTitle?: string;
    bio?: string;
    picture?: string;
  }) => {
    setDraftStatus('saving');
    const draftPayload = {
      name: updated.name !== undefined ? updated.name : name,
      email: updated.email !== undefined ? updated.email : email,
      address: updated.address !== undefined ? updated.address : address,
      location: updated.location !== undefined ? updated.location : location,
      whatsapp: updated.whatsapp !== undefined ? updated.whatsapp : whatsapp,
      jobTitle: updated.jobTitle !== undefined ? updated.jobTitle : jobTitle,
      bio: updated.bio !== undefined ? updated.bio : bio,
      picture: updated.picture !== undefined ? updated.picture : picture,
    };
    localStorage.setItem(`kestrelProfileDraft_${user.id}`, JSON.stringify(draftPayload));
    setTimeout(() => {
      setDraftStatus('saved');
    }, 300);
  };

  const handleFetchProfileDetails = () => {
    // Falls back to direct mock matching
    setIsFetching(true);
    setFetchSuccess(false);

    setTimeout(() => {
      // Look inside our directory for exact match or general defaults
      const foundMatch = ssoProfileDirectory.find(acc => 
        acc.email.toLowerCase() === user.email?.toLowerCase() ||
        acc.name.toLowerCase() === user.name?.toLowerCase()
      );

      const resolved = foundMatch ? {
        name: foundMatch.name,
        email: foundMatch.email,
        address: foundMatch.address || `${foundMatch.company || 'Ganta Tech'}, ${foundMatch.state}, ${foundMatch.country}`,
        location: `${foundMatch.state}, ${foundMatch.country}`,
        whatsapp: foundMatch.phone,
        jobTitle: 'Kestrel System Integrator',
        bio: 'SSO integrated enterprise operations manager.',
        picture: user.picture
      } : {
        name: user.name || 'Eshwar Ganta',
        email: user.email || 'eshwar@kestrelaisolutions.com',
        address: 'DNO.10-259, Plot No.16, Visalakshi Nagar, Visakhapatnam, Andhra Pradesh, 530043',
        location: 'Visakhapatnam, Andhra Pradesh, India',
        whatsapp: '+91 88972 26495',
        jobTitle: user.jobTitle || 'Founder & CEO',
        bio: user.bio || 'Enterprise systems developer at Kestrel AI Solutions.',
        picture: user.picture
      };

      setName(resolved.name);
      setEmail(resolved.email);
      setAddress(resolved.address);
      setLocation(resolved.location);
      setWhatsapp(resolved.whatsapp);
      setJobTitle(resolved.jobTitle);
      setBio(resolved.bio);
      setPicture(resolved.picture);

      // Save automatically in local draft cache
      localStorage.setItem(`kestrelProfileDraft_${user.id}`, JSON.stringify(resolved));
      setDraftStatus('saved');
      setIsFetching(false);
      setFetchSuccess(true);
      setTimeout(() => setFetchSuccess(false), 3000);
    }, 1200);
  };

  const handleFetchOAuthProfile = async (provider: OAuthProvider) => {
    setIsFetching(true);
    setActiveProvider(provider);
    setFetchSuccess(false);

    try {
      const resolved = await fetchSimulatedOAuthDetails(provider, name || user.name, email || user.email);
      
      setName(resolved.name);
      setEmail(resolved.email);
      setAddress(resolved.address);
      setLocation(resolved.location);
      setWhatsapp(resolved.whatsapp);
      setJobTitle(resolved.jobTitle);
      setBio(resolved.bio);
      setPicture(resolved.picture);

      // Save automatically in local draft cache
      localStorage.setItem(`kestrelProfileDraft_${user.id}`, JSON.stringify(resolved));
      setDraftStatus('saved');
      setFetchSuccess(true);
      setTimeout(() => setFetchSuccess(false), 3000);
    } catch (e) {
      console.error("OAuth simulation failed:", e);
    } finally {
      setIsFetching(false);
      setActiveProvider(null);
      setShowProviderMenu(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64String = await fileToDataUrl(file);
        const resizedImage = await resizeImage(base64String, 256, 256);
        setPicture(resizedImage);
        saveDraft({ picture: resizedImage });
      } catch (error) {
        console.error("Failed to process profile image:", error);
        alert("There was an error updating your profile picture.");
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    const currentErrors = validateForm({ name, email, address, location, whatsapp, jobTitle, bio });
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      const firstError = Object.keys(currentErrors)[0];
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    updateUser({ name, email, address, location, whatsapp, jobTitle, bio, picture });
    
    // Clear the active draft copy and submission status on successful manual save to permanent claims
    localStorage.removeItem(`kestrelProfileDraft_${user.id}`);
    setDraftStatus('idle');
    setFormSubmitted(false);
    setTouchedFields({});
  };

  const hasDraftActive = 
    (localStorage.getItem(`kestrelProfileDraft_${user.id}`) !== null) ||
    user.name !== name || 
    user.email !== email ||
    (user.address || '') !== address ||
    (user.location || '') !== location ||
    (user.whatsapp || '') !== whatsapp ||
    (user.jobTitle || '') !== jobTitle ||
    (user.bio || '') !== bio ||
    user.picture !== picture;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
          <UserIcon className="w-8 h-8 mr-3 text-kestrel-blue"/>Your Professional Profile
        </h1>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            disabled={isFetching}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-150 text-indigo-700 text-xs font-extrabold rounded-xl transition-all inline-flex items-center gap-1.5 border border-indigo-200 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isFetching ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {activeProvider ? `Authenticating ${activeProvider.toUpperCase()}...` : 'Syncing Registry...'}
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Fetch Details
              </>
            )}
          </button>

          {showProviderMenu && (
            <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-64 p-2 animate-fadeIn flex flex-col gap-1">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase p-2 tracking-wider border-b border-slate-100">Simulate OAuth Handshake</div>
              <button
                type="button"
                onClick={() => handleFetchOAuthProfile('google')}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Google Workspace SSO
              </button>
              <button
                type="button"
                onClick={() => handleFetchOAuthProfile('microsoft')}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Microsoft Entra ID
              </button>
              <button
                type="button"
                onClick={() => handleFetchOAuthProfile('github')}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>GitHub Developer Profile
              </button>
              <button
                type="button"
                onClick={handleFetchProfileDetails}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-[11px] font-bold text-indigo-600 rounded-lg flex items-center gap-2 border-t border-slate-150 cursor-pointer mt-1 pt-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Direct Registry Fallback
              </button>
            </div>
          )}
        </div>
      </div>

      {fetchSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-xs animate-fadeIn flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Profile details matched and fetched successfully! Changes are auto-saved to active draft.
        </div>
      )}

      <DashboardCard title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          <span>Enterprise Credentials Verification</span>
          {draftStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 font-extrabold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Auto-saving draft...
            </span>
          )}
          {draftStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Draft saved automatically (Offline-safe)
            </span>
          )}
          {draftStatus === 'idle' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 font-bold">
              ✔ Synced with Active JWT Claims
            </span>
          )}
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Profile Picture Section */}
          <div className="md:col-span-1 flex flex-col items-center space-y-4">
            <div className="relative group w-48 h-48">
              <img
                src={picture || user.picture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover shadow-lg ring-4 ring-offset-2 ring-kestrel-blue/50"
              />
              <button
                type="button"
                onClick={triggerImageUpload}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change profile picture"
              >
                <EditIcon className="w-10 h-10 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 text-center">Click avatar to swap corporate image.</p>
            {jobTitle && (
              <p className="text-xs font-extrabold text-indigo-650 uppercase tracking-widest text-center px-2 pt-1">{jobTitle}</p>
            )}
            {bio && (
              <p className="text-xs text-slate-500 text-center italic bg-slate-50/50 border border-slate-150 p-3 rounded-xl max-w-xs leading-relaxed">
                "{bio}"
              </p>
            )}
          </div>

          {/* Profile Form Section */}
          <div className="md:col-span-2">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('name') ? 'text-rose-500' : 'text-slate-500'}`}>
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      saveDraft({ name: e.target.value });
                      if (!touchedFields.name) setTouchedFields(prev => ({ ...prev, name: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 transition-all ${
                      shouldShowError('name') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="Your full name"
                  />
                  {shouldShowError('name') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.name}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('email') ? 'text-rose-500' : 'text-slate-500'}`}>
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      saveDraft({ email: e.target.value });
                      if (!touchedFields.email) setTouchedFields(prev => ({ ...prev, email: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 transition-all ${
                      shouldShowError('email') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {shouldShowError('email') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="jobTitle" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('jobTitle') ? 'text-rose-500' : 'text-slate-500'}`}>
                  Professional Job Title <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="jobTitle"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      saveDraft({ jobTitle: e.target.value });
                      if (!touchedFields.jobTitle) setTouchedFields(prev => ({ ...prev, jobTitle: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, jobTitle: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 transition-all ${
                      shouldShowError('jobTitle') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="e.g. Chief Systems Architect / Tech Lead"
                  />
                  {shouldShowError('jobTitle') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.jobTitle}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('bio') ? 'text-rose-500' : 'text-slate-500'}`}>
                  Professional Biography (Bio) <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <textarea
                    name="bio"
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      saveDraft({ bio: e.target.value });
                      if (!touchedFields.bio) setTouchedFields(prev => ({ ...prev, bio: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, bio: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 transition-all ${
                      shouldShowError('bio') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="Tell us about your professional background and vision..."
                  />
                  {shouldShowError('bio') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.bio}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="address" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('address') ? 'text-rose-500' : 'text-slate-500'}`}>
                  Corporate Address Details <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      saveDraft({ address: e.target.value });
                      if (!touchedFields.address) setTouchedFields(prev => ({ ...prev, address: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 transition-all ${
                      shouldShowError('address') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="Enter your address details"
                  />
                  {shouldShowError('address') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.address}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="location" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('location') ? 'text-rose-500' : 'text-slate-500'}`}>
                  City & Geographic Region <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      saveDraft({ location: e.target.value });
                      if (!touchedFields.location) setTouchedFields(prev => ({ ...prev, location: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, location: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 transition-all ${
                      shouldShowError('location') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="City, State, Country"
                  />
                  {shouldShowError('location') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.location}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="whatsapp" className={`block text-xs font-extrabold uppercase tracking-wider mb-1 transition-colors ${shouldShowError('whatsapp') ? 'text-rose-500' : 'text-slate-500'}`}>
                  WhatsApp Contact Link <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    name="whatsapp"
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      saveDraft({ whatsapp: e.target.value });
                      if (!touchedFields.whatsapp) setTouchedFields(prev => ({ ...prev, whatsapp: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, whatsapp: true }))}
                    className={`block w-full rounded-xl shadow-sm focus:ring-2 sm:text-xs p-3 border font-semibold bg-slate-50/50 font-mono transition-all ${
                      shouldShowError('whatsapp') 
                        ? 'border-rose-300 ring-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/10' 
                        : 'border-slate-200 focus:border-kestrel-blue focus:ring-kestrel-blue text-slate-700'
                    }`}
                    placeholder="e.g. +91 8897226495"
                  />
                  {shouldShowError('whatsapp') && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.whatsapp}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <div className="text-[11px] text-slate-450 font-medium">
                  {hasDraftActive ? (
                    <span className="text-amber-600 font-bold">● Draft changes will be saved to secure claims once clicked →</span>
                  ) : (
                    <span>All changes synchronized with JWT scope.</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!hasDraftActive}
                  className="inline-flex justify-center rounded-xl border border-transparent bg-kestrel-blue hover:bg-indigo-700 py-2.5 px-6 text-xs font-extrabold text-white shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-kestrel-blue focus:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardCard>
    </>
  );
};

export default ProfileScreen;
