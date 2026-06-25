import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Map, 
  Globe, 
  Check, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  MessageSquareCode,
  Edit,
  Plus,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface ContactUsViewProps {
  handleContactSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface CompanyContactDetails {
  address: string;
  emails: string[];
  whatsapp: string;
  mapUrl: string;
}

const ContactUsView: React.FC<ContactUsViewProps> = ({ handleContactSubmit }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'transit'>('standard');
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

  // Stateful enterprise contact details with localStorage persistence
  const [contactDetails, setContactDetails] = useState<CompanyContactDetails>(() => {
    const saved = localStorage.getItem('kestrelCompanyContactDetails');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse kestrelCompanyContactDetails', e);
      }
    }
    return {
      address: "DNO.10-259, Plot No.16, Visalakshi Nagar, Visakhapatnam, Andhra Pradesh, 530043, India.",
      emails: ["eshwar@kestrelaisolutions.com", "eswarganta1985@gmail.com"],
      whatsapp: "+91 8897226495",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.2372551406834!2d83.33611!3d17.73489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39433e54bdad95%3A0xe5ebd137a1e0b5aa!2sVisalakshi%20Nagar%2C%20Visakhapatnam%2C%20Andhra%20Pradesh%20530043!5e0!3m2!1sen!2sin!4v1718712345678!5m2!1sen!2sin"
    };
  });

  useEffect(() => {
    localStorage.setItem('kestrelCompanyContactDetails', JSON.stringify(contactDetails));
  }, [contactDetails]);

  // Form states matching client's data structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    location: '',
    whatsapp: '',
    message: ''
  });

  // Client-side validation errors state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    address: '',
    location: '',
    whatsapp: '',
    message: ''
  });

  // Saved snapshot for the success receipt display
  const [submittedSnapshot, setSubmittedSnapshot] = useState<typeof formData | null>(null);

  // WhatsApp helper wizard variables
  const [waPreset, setWaPreset] = useState<'consultation' | 'synergy' | 'support'>('consultation');
  const [waCustomMessage, setWaCustomMessage] = useState(
    "Hi Eshwar Ganta, I am interested in exploring Kestrel AI Solution's high-performance AI deployment and systems automation options."
  );

  const presets = {
    consultation: "Hi Eshwar Ganta, I am interested in exploring Kestrel AI Solution's high-performance AI deployment and enterprise automation options.",
    synergy: "Hi Eshwar Ganta, I want to discuss a strategic partnership and joint business synergy with Kestrel AI Solutions.",
    support: "Dear Support, we require assistance regarding enterprise billing and custom license configurations."
  };

  const handleWaPresetChange = (type: 'consultation' | 'synergy' | 'support') => {
    setWaPreset(type);
    setWaCustomMessage(presets[type]);
  };

  const validateField = (name: string, value: string): string => {
    let errorMsg = '';
    const trimmed = value.trim();

    switch (name) {
      case 'name':
        if (!trimmed) {
          errorMsg = 'Name is required.';
        } else if (trimmed.length < 2) {
          errorMsg = 'Name must be at least 2 characters.';
        }
        break;
      case 'email':
        if (!trimmed) {
          errorMsg = 'Email address is required.';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmed)) {
            errorMsg = 'Please enter a valid email address.';
          }
        }
        break;
      case 'address':
        if (!trimmed) {
          errorMsg = 'Address is required.';
        } else if (trimmed.length < 10) {
          errorMsg = 'Address is too short (please enter at least 10 characters detailing street/office).';
        }
        break;
      case 'location':
        if (!trimmed) {
          errorMsg = 'Physical Location is required.';
        } else if (!trimmed.includes(',')) {
          errorMsg = 'Please specify location as "City, State, Country" (separated by a comma).';
        } else if (trimmed.length < 5) {
          errorMsg = 'Please provide a valid location description.';
        }
        break;
      case 'whatsapp':
        if (!trimmed) {
          errorMsg = 'WhatsApp Phone number is required.';
        } else {
          const cleaned = value.replace(/[^\d+]/g, '');
          const waRegex = /^\+?[1-9]\d{7,14}$/;
          if (!waRegex.test(cleaned)) {
            errorMsg = 'Please enter a valid WhatsApp phone number (8 to 15 digits, e.g., +91 8897226495).';
          }
        }
        break;
      case 'message':
        if (!trimmed) {
          errorMsg = 'Detailed inquiry message is required.';
        } else if (trimmed.length < 10) {
          errorMsg = 'Inquiry message must be at least 10 characters.';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasValidationError = false;
    const tempErrors = { name: '', email: '', address: '', location: '', whatsapp: '', message: '' };

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof typeof formData;
      const errorMsg = validateField(fieldName, formData[fieldName]);
      if (errorMsg) {
        hasValidationError = true;
        tempErrors[fieldName] = errorMsg;
      }
    });

    if (hasValidationError) {
      setErrors(tempErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      handleContactSubmit(e);
      
      setSubmittedSnapshot({ ...formData });
      setIsSubmitted(true);
      setIsSubmitting(false);

      setFormData({ 
        name: '', 
        email: '', 
        address: '', 
        location: '', 
        whatsapp: '', 
        message: '' 
      });
      setErrors({
        name: '',
        email: '',
        address: '',
        location: '',
        whatsapp: '',
        message: ''
      });
    }, 1500);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const getWhatsAppLink = (messageText: string) => {
    const cleanedPhone = contactDetails.whatsapp.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(messageText)}`;
  };

  const getMapFilterClass = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'contrast-125 saturate-120 hover:contrast-100 transition-all duration-500';
      case 'transit':
        return 'hue-rotate-15 contrast-100 invert-[5%] bg-slate-900 transition-all duration-500';
      case 'standard':
      default:
        return 'grayscale-[15%] transition-all duration-500';
    }
  };

  // CMS MODAL STATES & METHODS
  const [isGeneralContactModalOpen, setIsGeneralContactModalOpen] = useState(false);
  const [generalContactState, setGeneralContactState] = useState({
    address: '',
    whatsapp: '',
    mapUrl: ''
  });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editEmailIdx, setEditEmailIdx] = useState<number | null>(null);
  const [emailInputState, setEmailInputState] = useState('');

  const openGeneralContactModal = () => {
    setGeneralContactState({
      address: contactDetails.address,
      whatsapp: contactDetails.whatsapp,
      mapUrl: contactDetails.mapUrl
    });
    setIsGeneralContactModalOpen(true);
  };

  const handleSaveGeneralContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactDetails(prev => ({
      ...prev,
      address: generalContactState.address,
      whatsapp: generalContactState.whatsapp,
      mapUrl: generalContactState.mapUrl
    }));
    setIsGeneralContactModalOpen(false);
  };

  const openEmailModal = (index: number | null) => {
    if (index !== null) {
      setEditEmailIdx(index);
      setEmailInputState(contactDetails.emails[index]);
    } else {
      setEditEmailIdx(null);
      setEmailInputState('');
    }
    setIsEmailModalOpen(true);
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInputState.trim();
    if (!cleanEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      alert("Please enter a valid corporate email format.");
      return;
    }

    const updatedEmails = [...contactDetails.emails];
    if (editEmailIdx !== null) {
      updatedEmails[editEmailIdx] = cleanEmail;
    } else {
      updatedEmails.push(cleanEmail);
    }

    setContactDetails(prev => ({
      ...prev,
      emails: updatedEmails
    }));
    setIsEmailModalOpen(false);
  };

  const handleDeleteEmail = (index: number) => {
    if (contactDetails.emails.length <= 1) {
      alert("You must retain at least one registered corporate contact email address.");
      return;
    }
    if (confirm(`Are you sure you want to delete corporate contact email: ${contactDetails.emails[index]}?`)) {
      const updatedEmails = contactDetails.emails.filter((_, i) => i !== index);
      setContactDetails(prev => ({
        ...prev,
        emails: updatedEmails
      }));
    }
  };

  return (
    <div className="relative space-y-12 py-4">
      
      {/* Intro Badge list and Title Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 text-xs font-black uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          Enterprise Connection Portal
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Let's Build Something Great
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed font-semibold max-w-2xl mx-auto">
          Connect immediately with our solutions engineers. Complete the interactive form below or launch direct WhatsApp pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Map Preview & Access Channels */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Headquarters and Map Preview card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-slate-850 tracking-tight">Our Headquarters</h2>
                <p className="text-xs text-slate-500 font-medium">Headquartered in the vibrant coastal technology hub of Visakhapatnam, India.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                <Globe className="w-3.5 h-3.5" /> India
              </span>
            </div>

            {/* Map Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-550 uppercase tracking-widest flex items-center gap-1">
                  <Map className="w-3.5 h-3.5 text-indigo-500" />
                  Map Preview Options
                </span>
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setMapStyle('standard')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${mapStyle === 'standard' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Vector
                  </button>
                  <button
                    onClick={() => setMapStyle('satellite')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${mapStyle === 'satellite' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapStyle('transit')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${mapStyle === 'transit' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Transit
                  </button>
                </div>
              </div>

              {/* Dynamic Google Maps embed iframe */}
              <div className="relative overflow-hidden rounded-xl border border-slate-150 h-64 bg-slate-100 shadow-inner group">
                <iframe
                  title="Kestrel AI Solution Headquarters Map"
                  src={contactDetails.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all duration-500 ${getMapFilterClass()}`}
                />
                
                {/* Embedded dynamic Floating indicator pointing directly on Visalakshi Nagar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                    <span className="text-xs font-bold truncate">Visalakshi Nagar Hub</span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold bg-white text-slate-900 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Channels List: Addresses, Emails, WhatsApp (with Admin Edit options) */}
            <div className="space-y-4 pt-2">
              
              {/* Address detail */}
              <div className="flex gap-4 p-3 bg-slate-50/55 rounded-xl border border-slate-100 hover:bg-white transition-all group/address relative">
                <div className="p-2.5 bg-blue-50 border border-blue-100 text-[#2563eb] rounded-lg h-fit flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Principal Address</span>
                    {isAdmin && (
                      <button
                        onClick={openGeneralContactModal}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                        title="Edit Company Details"
                      >
                        <Edit className="w-3.5 h-3.5" /> <span>Edit</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-705 font-bold leading-normal">
                    {contactDetails.address}
                  </p>
                </div>
              </div>

              {/* Corporate Emails detail */}
              <div className="flex gap-4 p-3 bg-slate-50/55 rounded-xl border border-slate-100 hover:bg-white transition-all group/emails relative">
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg h-fit flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Corporate Emails</span>
                    {isAdmin && (
                      <button
                        onClick={() => openEmailModal(null)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-0.5 cursor-pointer"
                        title="Register New Corporate Email"
                      >
                        <Plus className="w-3.5 h-3.5" /> <span>Add</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {contactDetails.emails.map((email, idx) => (
                      <div key={idx} className="flex items-center justify-between group/email-row hover:bg-slate-50 p-1.5 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                        <a href={`mailto:${email}`} className="text-xs text-indigo-600 hover:text-indigo-805 font-bold break-all block transition-colors leading-none">
                          {email}
                        </a>
                        {isAdmin && (
                          <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 shadow-xs scale-90">
                            <button
                              onClick={() => openEmailModal(idx)}
                              className="text-slate-500 hover:text-kestrel-blue p-0.5 cursor-pointer"
                              title="Edit Email Address"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmail(idx)}
                              className="text-slate-500 hover:text-rose-600 p-0.5 cursor-pointer"
                              title="Delete Email Address"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Standard WhatsApp launcher detail */}
              <div className="flex gap-4 p-3 bg-emerald-50/20 rounded-xl border border-emerald-100/50 hover:bg-white transition-all group/whatsapp relative">
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg h-fit flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-emerald-605 tracking-widest block">WhatsApp Business</span>
                    {isAdmin && (
                      <button
                        onClick={openGeneralContactModal}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
                        title="Edit WhatsApp Coordinates"
                      >
                        <Edit className="w-3.5 h-3.5" /> <span>Edit</span>
                      </button>
                    )}
                  </div>
                  <a 
                    href={`https://wa.me/${contactDetails.whatsapp.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-800 hover:text-emerald-700 font-extrabold flex items-center gap-1.5 transition-colors"
                  >
                    <span>{contactDetails.whatsapp}</span>
                    <span className="text-[9px] bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Launch Support</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Quick FAQ / Prompt alert */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden flex items-center gap-4">
            <div className="p-3 bg-slate-800 text-amber-400 rounded-xl animate-pulse">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Response Assurance SLA</h4>
              <p className="text-[11px] text-slate-305 leading-relaxed mt-1 font-medium">All strategic inbound leads are systematically routed to Eshwar Ganta within 2 business hours.</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Form with customizable success animation */}
        <div className="lg:col-span-7">
          
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {isSubmitted ? (
                // SUCCESS STATE WITH PRESTIGE MOTION ANIMATION
                <motion.div 
                  key="success-receipt"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 py-4 flex-grow flex flex-col justify-center text-center"
                >
                  <div className="space-y-4">
                    <div className="relative mx-auto w-16 h-16 bg-emerald-50 border-2 border-emerald-300 rounded-full flex items-center justify-center text-emerald-500 overflow-hidden">
                      <motion.div 
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
                      >
                        <CheckCircle2 className="w-10 h-10" />
                      </motion.div>
                      
                      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transmission Successful</h3>
                      <p className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Pipeline Securely Activated
                      </p>
                    </div>
                  </div>

                  {/* CUSTOM PARAMETER SNAPSHOT RECEIPT BOX */}
                  {submittedSnapshot && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-left space-y-4 shadow-inner max-w-lg mx-auto w-full"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inquiry Snapshot</span>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">Verified Secure</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Sender Name:</span>
                          <span className="font-extrabold text-slate-800 text-xs truncate max-w-[170px] block">{submittedSnapshot.name}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Routing Email:</span>
                          <span className="font-extrabold text-slate-800 text-xs truncate max-w-[170px] block">{submittedSnapshot.email}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Physical Location:</span>
                          <span className="font-extrabold text-slate-800 text-xs truncate max-w-[170px] block">{submittedSnapshot.location}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">WhatsApp channel:</span>
                          <span className="font-extrabold text-slate-800 text-xs truncate max-w-[170px] block">{submittedSnapshot.whatsapp || "Not provided"}</span>
                        </div>
                        <div className="col-span-2 space-y-0.5 border-t border-slate-150 pt-2.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Inquiry Message:</span>
                          <p className="text-slate-600 italic leading-relaxed text-xs line-clamp-3">"{submittedSnapshot.message}"</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                      Thank you! Our automated coordination engine has scheduled this input with our registered office mailboxes successfully.
                    </p>
                    
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mx-auto flex items-center justify-center gap-1.5 text-xs font-extrabold text-indigo-650 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm border border-indigo-100"
                    >
                      Create Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                // FORM EDITING STATE
                <form onSubmit={onSubmit} className="space-y-6">
                  
                  <div className="space-y-1 border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-extrabold text-slate-850 tracking-tight">Interactive Request Desk</h2>
                    <p className="text-xs text-slate-500 font-medium">Please fulfill the parameters below to trigger our direct feedback SLA.</p>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="name-form" className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name-form"
                        placeholder="E.g. Eshwar Ganta"
                        value={formData.name}
                        onChange={onChange}
                        required
                        className={`block w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-xs text-sm transition-all outline-none ${
                          errors.name 
                          ? 'border-red-300 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="email-form" className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">Your Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email-form"
                        placeholder="E.g. eshwar@kestrelaisolutions.com"
                        value={formData.email}
                        onChange={onChange}
                        required
                        className={`block w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-xs text-sm transition-all outline-none ${
                          errors.email 
                          ? 'border-red-300 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="address-form" className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">Address</label>
                    <input
                      type="text"
                      name="address"
                      id="address-form"
                      placeholder="Street name, suite, office block, sector"
                      value={formData.address}
                      onChange={onChange}
                      required
                      className={`block w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-xs text-sm transition-all outline-none ${
                        errors.address 
                        ? 'border-red-300 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                      }`}
                    />
                    {errors.address ? (
                      <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.address}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-medium">Please enter a complete home or corporate address details (min. 10 chars).</p>
                    )}
                  </div>

                  {/* Physical Location and WhatsApp Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="location-form" className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">Physical Location</label>
                      <input
                        type="text"
                        name="location"
                        id="location-form"
                        placeholder="City, State, Country"
                        value={formData.location}
                        onChange={onChange}
                        required
                        className={`block w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-xs text-sm transition-all outline-none ${
                          errors.location 
                          ? 'border-red-300 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      />
                      {errors.location ? (
                        <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.location}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">Format as &quot;City, State, Country&quot;.</p>
                      )}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="whatsapp-form" className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">WhatsApp Phone Number</label>
                      <input
                        type="tel"
                        name="whatsapp"
                        id="whatsapp-form"
                        placeholder={`E.g. ${contactDetails.whatsapp}`}
                        value={formData.whatsapp}
                        onChange={onChange}
                        required
                        className={`block w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-xs text-sm transition-all outline-none ${
                          errors.whatsapp 
                          ? 'border-red-300 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      />
                      {errors.whatsapp ? (
                        <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.whatsapp}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">Include country code (8 to 15 digits).</p>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="message-form" className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">Detailed Brief Inquiry</label>
                    <textarea
                      name="message"
                      id="message-form"
                      rows={4}
                      placeholder="Specify your system constraints, budget milestones, and target general architecture rules..."
                      value={formData.message}
                      onChange={onChange}
                      required
                      className={`block w-full rounded-xl border px-4 py-3 text-slate-900 shadow-xs text-sm transition-all outline-none resize-none ${
                        errors.message 
                        ? 'border-red-300 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                      }`}
                    />
                    {errors.message ? (
                      <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-medium font-serif italic">Minimum length 10 characters.</p>
                    )}
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-650 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Routing Over secure channels...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Secure Inquiry</span>
                          <Send className="w-4 h-4 fill-white" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* LOWER SECTION: Interactive WhatsApp preset messaging helper */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 shadow-inner grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 space-y-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-full">
            <Sparkles className="w-3 h-3 text-emerald-650" /> Instant Synchronizer
          </span>
          <h2 className="text-xl font-extrabold text-slate-850 tracking-tight">Direct WhatsApp Wizard</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            Choose a preset scenario below to automatically construct an optimized communication string. Then launcher the secure chat pipeline instantly.
          </p>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleWaPresetChange('consultation')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                waPreset === 'consultation' 
                ? 'bg-white border-emerald-500 shadow-md text-emerald-700 ring-2 ring-emerald-500/10' 
                : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <h3 className="text-xs font-black uppercase tracking-wider">Consultation</h3>
              <p className="text-[9px] mt-0.5 opacity-80 leading-snug">System Alignment</p>
            </button>
            <button
              onClick={() => handleWaPresetChange('synergy')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                waPreset === 'synergy' 
                ? 'bg-white border-emerald-500 shadow-md text-emerald-700 ring-2 ring-emerald-500/10' 
                : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <h3 className="text-xs font-black uppercase tracking-wider">Partnership</h3>
              <p className="text-[9px] mt-0.5 opacity-80 leading-snug">Strategic Synergy</p>
            </button>
            <button
              onClick={() => handleWaPresetChange('support')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                waPreset === 'support' 
                ? 'bg-white border-emerald-500 shadow-md text-emerald-700 ring-2 ring-emerald-500/10' 
                : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <h3 className="text-xs font-black uppercase tracking-wider">License</h3>
              <p className="text-[9px] mt-0.5 opacity-80 leading-snug">Enterprise Support</p>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={waCustomMessage}
              onChange={(e) => setWaCustomMessage(e.target.value)}
              className="w-full bg-white rounded-xl border border-slate-200 p-3.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-xs resize-none"
            />
            <button
              onClick={() => window.open(getWhatsAppLink(waCustomMessage), '_blank')}
              className="absolute right-3.5 bottom-3.5 py-1.5 px-3 bg-emerald-505 hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 hover:translate-y-[-1px]"
            >
              <span>Launch Chat</span>
              <Send className="w-3 h-3 fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* FLOAT AREA: Persistent launcher on high scrolling indicators */}
      <div>
        <AnimatePresence>
          {!showFloatingWidget && (
            <motion.button
              onClick={() => setShowFloatingWidget(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-6 right-6 flex items-center gap-2 p-3.5 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 hover:border-emerald-500 text-white rounded-full shadow-2xl cursor-pointer relative group transition-colors z-40"
            >
              <span className="absolute -top-1.5 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow">
                1
              </span>
              <Phone className="w-6 h-6 fill-white" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-24 transition-all duration-300 font-extrabold text-[11px] uppercase tracking-wider whitespace-nowrap ease-out">
                Message Eshwar
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating live conversation helper window */}
        <AnimatePresence>
          {showFloatingWidget && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 18 }}
              className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xs w-80 overflow-hidden flex flex-col text-slate-800 z-40"
            >
              {/* Header inside floating helper */}
              <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" 
                      alt="Eshwar Ganta" 
                      className="w-8 h-8 rounded-full object-cover border border-emerald-400"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold">Eshwar Ganta</h4>
                    <p className="text-[10px] text-emerald-100 font-semibold">CEO & Founder (Online)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFloatingWidget(false)}
                  className="text-white hover:text-emerald-100 text-xs font-bold bg-emerald-700/50 hover:bg-emerald-700 px-2 py-1 rounded cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Message Context area inside helper */}
              <div className="p-4 bg-slate-50 space-y-3 flex-grow text-xs font-medium">
                <div className="bg-white rounded-xl p-3 border border-slate-100 relative shadow-sm">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Automated Operator</span>
                  <p className="text-slate-650 leading-relaxed text-[11px]">
                    Hello, you can chat with me directly on WhatsApp. Type a fast question below or click the green button to open chat!
                  </p>
                </div>
                
                <div className="space-y-1">
                  <input
                    type="text"
                    defaultValue="Hello Eshwar, I am reviewing the dashboard. Let's align on AI development."
                    id="floating-wa-input"
                    className="w-full text-[11px] rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Send Button inside helper */}
              <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
                <button
                  onClick={() => {
                    const inputElement = document.getElementById('floating-wa-input') as HTMLInputElement;
                    const msg = inputElement?.value || "Hello!";
                    window.open(getWhatsAppLink(msg), '_blank');
                  }}
                  className="w-full py-2 bg-emerald-505 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Open WhatsApp Support</span>
                  <Send className="w-3 h-3 fill-white" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CMS Company Contact info Dialog/Modal */}
      {isGeneralContactModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-[#2563eb] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Company General Details</h3>
              <button 
                onClick={() => setIsGeneralContactModalOpen(false)} 
                className="text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveGeneralContact} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Principal Corporate Address</label>
                <textarea
                  rows={2}
                  value={generalContactState.address}
                  onChange={(e) => setGeneralContactState({ ...generalContactState, address: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-blue-600 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">WhatsApp Business Coordinates</label>
                <input
                  type="text"
                  value={generalContactState.whatsapp}
                  onChange={(e) => setGeneralContactState({ ...generalContactState, whatsapp: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-blue-600 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Google Maps Embed iframe Source URL (src)</label>
                <textarea
                  rows={3}
                  value={generalContactState.mapUrl}
                  onChange={(e) => setGeneralContactState({ ...generalContactState, mapUrl: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-xs font-mono focus:border-blue-600 focus:ring-blue-600"
                  required
                  placeholder="Insert double quoted src parameter..."
                />
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsGeneralContactModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-705 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save General Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CMS Email Add/Edit Dialog/Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden">
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editEmailIdx !== null ? 'Modify Contact Email' : 'Register New Corporate Email'}
              </h3>
              <button 
                onClick={() => setIsEmailModalOpen(false)} 
                className="text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Corporate Email Address</label>
                <input
                  type="email"
                  value={emailInputState}
                  onChange={(e) => setEmailInputState(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-indigo-650 focus:ring-indigo-650"
                  required
                  placeholder="e.g. support@kestrelaisolutions.com"
                />
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-705 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editEmailIdx !== null ? 'Save Specs' : 'Register Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContactUsView;
