import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Lightbulb, 
  Target, 
  Sparkles, 
  Trophy, 
  Handshake, 
  ShieldCheck, 
  Award, 
  Heart, 
  Globe, 
  Compass, 
  Star,
  Edit, 
  Plus, 
  Trash2, 
  X, 
  Save
} from 'lucide-react';

interface AboutUsViewProps {
  onNavigate: (name: string) => void;
}

// Map literal icon names to dynamic lucide components safely
const IconMap: Record<string, any> = {
  Target,
  Trophy,
  Lightbulb,
  Handshake,
  ShieldCheck,
  Award,
  Heart,
  Globe,
  Compass,
  Star,
  Sparkles
};

// Preset colors for aims to ensure maximum contrast and visual elegance
const COLOR_PRESETS = [
  { value: 'blue', label: 'Tech Blue', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
  { value: 'amber', label: 'Gold Amber', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-500' },
  { value: 'teal', label: 'Modern Teal', bg: 'bg-teal-50 border-teal-100', text: 'text-teal-600' },
  { value: 'emerald', label: 'Growth Emerald', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
  { value: 'indigo', label: 'Deep Indigo', bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600' },
  { value: 'rose', label: 'Coral Rose', bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600' },
  { value: 'cyan', label: 'Neon Cyan', bg: 'bg-cyan-50 border-cyan-100', text: 'text-cyan-600' },
  { value: 'purple', label: 'Noble Purple', bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600' }
];

interface AboutUsContent {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  quoteText: string;
  quoteAuthor: string;
  quoteAuthorRole: string;
  quoteImage: string;
  aims: Array<{
    title: string;
    desc: string;
    iconName: string;
    colorBg: string;
    colorText: string;
  }>;
}

const AboutUsView: React.FC<AboutUsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  // Read saved claims or initialize state
  const [aboutUs, setAboutUs] = useState<AboutUsContent>(() => {
    const saved = localStorage.getItem('kestrelAboutUsContent');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse kestrelAboutUsContent', e);
      }
    }
    return {
      heroBadge: "Mission & Vision Statement",
      heroTitle: "About Kestrel AI Solution",
      heroDescription: "Our core purpose is to architect high-performance digital ecosystems that bridge human intent with artificial general intelligence solutions.",
      quoteText: "We believe that complexity is the enemy of progress. The most robust AI systems are those built on structured elegance, high synergy, and absolute logical transparency.",
      quoteAuthor: "Mr Eshwar Ganta",
      quoteAuthorRole: "CEO & Founder",
      quoteImage: "https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      aims: [
        {
          title: "Impactful Solutions",
          desc: "Identifying key societal issues for impactful solutions that transform user experience.",
          iconName: "Target",
          colorBg: "bg-blue-50 border-blue-100",
          colorText: "text-blue-600"
        },
        {
          title: "Excellence & Quality",
          desc: "An unwavering commitment to delivering high-quality services with modern technology.",
          iconName: "Trophy",
          colorBg: "bg-amber-50 border-amber-100",
          colorText: "text-amber-550"
        },
        {
          title: "Simple & Clean Logic",
          desc: "Creating easily understandable programs with clean code and simple logic.",
          iconName: "Lightbulb",
          colorBg: "bg-amber-50 border-amber-100",
          colorText: "text-amber-600"
        },
        {
          title: "Aims of Synergy",
          desc: "Collaborating effectively with other companies to achieve compound growth.",
          iconName: "Handshake",
          colorBg: "bg-emerald-50 border-emerald-100",
          colorText: "text-emerald-600"
        },
        {
          title: "Timely Delivery",
          desc: "Timely delivery of robust projects adhering strictly to client and company guidelines.",
          iconName: "ShieldCheck",
          colorBg: "bg-indigo-50 border-indigo-100",
          colorText: "text-indigo-600"
        }
      ]
    };
  });

  // Write changes back to client store
  useEffect(() => {
    localStorage.setItem('kestrelAboutUsContent', JSON.stringify(aboutUs));
  }, [aboutUs]);

  // General content modal variables
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
  const [generalState, setGeneralState] = useState({
    heroBadge: '',
    heroTitle: '',
    heroDescription: '',
    quoteText: '',
    quoteAuthor: '',
    quoteAuthorRole: '',
    quoteImage: ''
  });

  // Aim modal variables
  const [isAimModalOpen, setIsAimModalOpen] = useState(false);
  const [editingAimIndex, setEditingAimIndex] = useState<number | null>(null);
  const [aimState, setAimState] = useState({
    title: '',
    desc: '',
    iconName: 'Target',
    colorPreset: 'blue'
  });

  const openGeneralModal = () => {
    setGeneralState({
      heroBadge: aboutUs.heroBadge,
      heroTitle: aboutUs.heroTitle,
      heroDescription: aboutUs.heroDescription,
      quoteText: aboutUs.quoteText,
      quoteAuthor: aboutUs.quoteAuthor,
      quoteAuthorRole: aboutUs.quoteAuthorRole,
      quoteImage: aboutUs.quoteImage
    });
    setIsGeneralModalOpen(true);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setAboutUs(prev => ({
      ...prev,
      heroBadge: generalState.heroBadge,
      heroTitle: generalState.heroTitle,
      heroDescription: generalState.heroDescription,
      quoteText: generalState.quoteText,
      quoteAuthor: generalState.quoteAuthor,
      quoteAuthorRole: generalState.quoteAuthorRole,
      quoteImage: generalState.quoteImage
    }));
    setIsGeneralModalOpen(false);
  };

  const openAimModal = (index: number | null) => {
    if (index !== null) {
      const aim = aboutUs.aims[index];
      // Resolve color preset from active classes
      const matchedPreset = COLOR_PRESETS.find(p => aim.colorBg.includes(p.value)) || COLOR_PRESETS[0];
      setAimState({
        title: aim.title,
        desc: aim.desc,
        iconName: aim.iconName,
        colorPreset: matchedPreset.value
      });
      setEditingAimIndex(index);
    } else {
      setAimState({
        title: '',
        desc: '',
        iconName: 'Target',
        colorPreset: 'blue'
      });
      setEditingAimIndex(null);
    }
    setIsAimModalOpen(true);
  };

  const handleSaveAim = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = COLOR_PRESETS.find(p => p.value === aimState.colorPreset) || COLOR_PRESETS[0];
    const newAim = {
      title: aimState.title,
      desc: aimState.desc,
      iconName: aimState.iconName,
      colorBg: preset.bg,
      colorText: preset.text
    };

    const updatedAims = [...aboutUs.aims];
    if (editingAimIndex !== null) {
      updatedAims[editingAimIndex] = newAim;
    } else {
      updatedAims.push(newAim);
    }

    setAboutUs(prev => ({
      ...prev,
      aims: updatedAims
    }));
    setIsAimModalOpen(false);
  };

  const handleDeleteAim = (index: number) => {
    if (confirm('Are you sure you want to delete this core aim & ideal registration?')) {
      const updatedAims = aboutUs.aims.filter((_, i) => i !== index);
      setAboutUs(prev => ({
        ...prev,
        aims: updatedAims
      }));
    }
  };

  return (
    <div className="space-y-12 py-4">
      {/* Hero Badge and Title Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          {aboutUs.heroBadge}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          {aboutUs.heroTitle}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed font-medium">
          {aboutUs.heroDescription}
        </p>

        {isAdmin && (
          <div className="pt-2">
            <button
              onClick={openGeneralModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-kestrel-blue to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Statement & Philosophy</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Core Aims Card Grid */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative corner highlights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-extrabold text-slate-805 tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
                <span className="w-2.5 h-6 bg-gradient-to-b from-[#2563eb] to-[#1e40af] rounded-full inline-block" />
                Our Core Aims & Ideals
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Following our founding vision to build clean, understandable, and highly optimized software.</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => openAimModal(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Core Aim</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aboutUs.aims.map((aim, index) => {
              const IconComponent = IconMap[aim.iconName] || Target;
              return (
                <div 
                  key={index} 
                  className="group relative bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 p-6 rounded-2xl transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl border w-fit ${aim.colorBg} ${aim.colorText} transition-transform group-hover:scale-105 duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-indigo-650 transition-colors">
                        {aim.title}
                      </h3>
                      <p className="text-xs text-slate-605 font-medium leading-relaxed">
                        {aim.desc}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-150 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openAimModal(index)}
                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-600 hover:text-kestrel-blue rounded-md transition-colors cursor-pointer"
                        title="Edit Aim"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAim(index)}
                        className="p-1 px-1.5 hover:bg-rose-50 text-slate-650 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="Delete Aim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom interactive Contact CTA Card to occupy the last bento spot */}
            <div className="group relative bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-col justify-between overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/5 rounded-full blur-md" />
              <div className="space-y-3 z-10">
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300">Have a custom requirement?</span>
                <h3 className="text-lg font-bold tracking-tight">Let's build together</h3>
                <p className="text-xs text-indigo-250 leading-relaxed">
                  We specialize in crafting tailor-made client experiences with bulletproof precision.
                </p>
              </div>
              <button
                onClick={() => onNavigate('Contact Us')}
                className="mt-6 w-full py-2.5 px-4 bg-white hover:bg-indigo-50 text-indigo-950 text-xs font-bold rounded-xl transition-all shadow-sm group-hover:translate-y-[-2px] cursor-pointer"
              >
                Get In Touch Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Quote / Philosophy Card */}
      <div className="grid md:grid-cols-5 gap-8 items-center bg-slate-900 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
        <div className="md:col-span-3 space-y-4 z-10">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#10b981]">Visionary Philosophy</h3>
          <blockquote className="text-xl md:text-2xl font-medium tracking-tight text-slate-100 leading-snug">
            "{aboutUs.quoteText}"
          </blockquote>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm font-black text-white">{aboutUs.quoteAuthor}</span>
            <span className="text-[10.5px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wide">{aboutUs.quoteAuthorRole}</span>
          </div>
        </div>
        <div className="md:col-span-2 relative h-48 md:h-full w-full min-h-[14rem] rounded-xl overflow-hidden shadow-inner border border-slate-800">
          <img 
            src={aboutUs.quoteImage} 
            alt="Foundational Vision"
            className="w-full h-full object-cover grayscale opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </div>
      </div>

      {/* CMS Statement & Philosophy Dialog/Modal */}
      {isGeneralModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-kestrel-blue text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Vision, Mission & Philosophy</h3>
              <button 
                onClick={() => setIsGeneralModalOpen(false)} 
                className="text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveGeneral} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Hero Badge Text</label>
                <input
                  type="text"
                  value={generalState.heroBadge}
                  onChange={(e) => setGeneralState({ ...generalState, heroBadge: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Hero Section Title</label>
                <input
                  type="text"
                  value={generalState.heroTitle}
                  onChange={(e) => setGeneralState({ ...generalState, heroTitle: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Hero Section Description</label>
                <textarea
                  rows={3}
                  value={generalState.heroDescription}
                  onChange={(e) => setGeneralState({ ...generalState, heroDescription: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                  required
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Visionary Philosophy Quote</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Quote Statement Text</label>
                  <textarea
                    rows={3}
                    value={generalState.quoteText}
                    onChange={(e) => setGeneralState({ ...generalState, quoteText: e.target.value })}
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm-quote focus:border-kestrel-blue focus:ring-kestrel-blue"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Quote Author Name</label>
                  <input
                    type="text"
                    value={generalState.quoteAuthor}
                    onChange={(e) => setGeneralState({ ...generalState, quoteAuthor: e.target.value })}
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Author Corporate Role</label>
                  <input
                    type="text"
                    value={generalState.quoteAuthorRole}
                    onChange={(e) => setGeneralState({ ...generalState, quoteAuthorRole: e.target.value })}
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Corporate Imagery Cover (URL)</label>
                <input
                  type="url"
                  value={generalState.quoteImage}
                  onChange={(e) => setGeneralState({ ...generalState, quoteImage: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm font-mono focus:border-kestrel-blue focus:ring-kestrel-blue"
                  required
                />
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6 md:sticky md:bottom-0">
                <button
                  type="button"
                  onClick={() => setIsGeneralModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-705 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save General Specifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CMS Core Aim Add/Edit Dialog/Modal */}
      {isAimModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-kestrel-blue text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingAimIndex !== null ? 'Modify Ideal Specification' : 'Register New Core Aim'}
              </h3>
              <button 
                onClick={() => setIsAimModalOpen(false)} 
                className="text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveAim} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Ideal / Aim Title</label>
                <input
                  type="text"
                  value={aimState.title}
                  onChange={(e) => setAimState({ ...aimState, title: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                  required
                  placeholder="e.g. Robust Scaling Solution"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Strategic Ideal Description</label>
                <textarea
                  rows={3}
                  value={aimState.desc}
                  onChange={(e) => setAimState({ ...aimState, desc: e.target.value })}
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                  required
                  placeholder="Formulate a brief focus detail"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Dynamic Icon</label>
                  <select
                    value={aimState.iconName}
                    onChange={(e) => setAimState({ ...aimState, iconName: e.target.value })}
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                  >
                    {Object.keys(IconMap).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1.5">Aesthetic Accent Theme</label>
                  <select
                    value={aimState.colorPreset}
                    onChange={(e) => setAimState({ ...aimState, colorPreset: e.target.value })}
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue whitespace-nowrap"
                  >
                    {COLOR_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAimModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-705 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAimIndex !== null ? 'Save Specs' : 'Add Strategic Ideal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUsView;
