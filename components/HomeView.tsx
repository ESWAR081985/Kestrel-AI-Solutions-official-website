import React, { useState } from 'react';
import { StaffMember, GalleryImage, YouTubeVideo } from '../types';
import { StarIcon as Star, LightbulbIcon as Lightbulb, MapPinIcon as MapPin, EnvelopeIcon as Envelope, PhoneIcon as Phone, EditIcon, SaveIcon, XMarkIcon, PlusIcon, TrashIcon } from './Icons';
import TeamSection from './TeamSection';
import GallerySection from './GallerySection';
import { YouTubeSection } from './YouTubeSection';
import { Play, Sparkles, Heart, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomeViewProps {
    staff: StaffMember[];
    onUpdateStaff: (updatedStaff: StaffMember[]) => void;
    companyGallery: GalleryImage[];
    onUpdateGallery: (updatedGallery: GalleryImage[]) => void;
    companyVideos: YouTubeVideo[];
    onUpdateVideos: (updatedVideos: YouTubeVideo[]) => void;
    servicesPage: number;
    onServicePageChange: (newPage: number) => void;
    onNavigate: (name: string) => void;
    scrollToContact: () => void;
    handleContactSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    totalServicePages: number;
    paginatedServices: any[];
    homeContent: {
        heroTitle: string;
        heroSubtitle: string;
        historyTitle: string;
        historyText: string;
        historyImage: string;
        approachTitle: string;
        approachText: string;
        approachImage: string;
        servicesTitle: string;
        servicesText: string;
        servicesImage: string;
    };
    onUpdateHomeContent: (updated: any) => void;
    ourServices: any[];
    onUpdateOurServices: (updated: any[]) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
    staff,
    onUpdateStaff,
    companyGallery,
    onUpdateGallery,
    companyVideos,
    onUpdateVideos,
    servicesPage,
    onServicePageChange,
    onNavigate,
    scrollToContact,
    handleContactSubmit,
    totalServicePages,
    paginatedServices,
    homeContent,
    onUpdateHomeContent,
    ourServices,
    onUpdateOurServices
}) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [topActiveIndex, setTopActiveIndex] = useState(0);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const servicesPerPage = 2;

    const getYouTubeId = (link: string) => {
        if (!link) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = link.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getThumbnailUrl = (video: YouTubeVideo) => {
        if (video.isUploaded) {
            return `https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=60`;
        }
        const id = getYouTubeId(video.url);
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60`;
    };

    // Filter to only featured (liked/selected) videos
    const likedVideos = companyVideos.filter(v => v.isLiked);
    const activeIndex = topActiveIndex >= likedVideos.length ? 0 : topActiveIndex;
    const activeVideo = likedVideos[activeIndex];

    return (
        <div className="space-y-16">
            {/* Welcome Section */}
            <section className="text-center pt-8 relative group">
                {isAdmin && (
                    <button
                        onClick={() => {
                            setEditingSection('hero');
                            setEditForm({
                                heroTitle: homeContent.heroTitle,
                                heroSubtitle: homeContent.heroSubtitle
                            });
                        }}
                        className="absolute top-2 right-2 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit Hero Header Copy"
                    >
                        <EditIcon className="w-3.5 h-3.5" />
                        <span>Edit Welcome Banner</span>
                    </button>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-kestrel-blue mb-4 tracking-tight">
                    {homeContent.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-6">
                    {homeContent.heroSubtitle}
                </p>



                {likedVideos.length > 0 && activeVideo ? (
                    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-150/80 overflow-hidden text-left p-6 md:p-8 animate-in fade-in duration-300">
                        {/* Dynamic Label Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500 border border-amber-200">
                                    <Sparkles className="w-5 h-5 fill-amber-400" />
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        Active Featured Presentation
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">Selected and Starred showcase straight from the Kestrel Media Hub</p>
                                </div>
                            </div>
                            
                            {/* Counter Indicator */}
                            <span className="text-[11px] font-black uppercase text-kestrel-blue bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                                {activeIndex + 1} of {likedVideos.length} Selected
                            </span>
                        </div>

                        {/* Interactive Grid: Large Player & Thumbnail Sidebar */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Main Active Screen */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden shadow-md border border-slate-200">
                                    {activeVideo.isUploaded ? (
                                        <video
                                            key={activeVideo.id}
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                            className="w-full h-full object-contain bg-black"
                                            src={activeVideo.localVideoUrl || activeVideo.url}
                                        />
                                    ) : (
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.url)}?autoplay=1&mute=1&playlist=${getYouTubeId(activeVideo.url)}&loop=1&controls=1&showinfo=1&modestbranding=1`}
                                            title={activeVideo.title}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                        ></iframe>
                                    )}
                                </div>

                                {/* Selection details card */}
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100/80 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-kestrel-blue"></div>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                                {activeVideo.isUploaded ? 'UPLOADED MEDIA' : 'YOUTUBE LINK'}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800 leading-snug pt-0.5">{activeVideo.title}</h3>
                                        </div>
                                        {activeVideo.url && !activeVideo.isUploaded && (
                                            <a
                                                href={activeVideo.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-kestrel-blue hover:underline flex items-center gap-1 font-bold bg-white px-2.5 py-1 rounded border shadow-xs"
                                            >
                                                <span>YouTube</span> <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                                        {activeVideo.description}
                                    </p>
                                </div>
                            </div>

                            {/* Sidemenu with available Liked Streams */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                    Starred Choices Feed
                                </h4>

                                <div className="space-y-2.5 max-h-[22rem] overflow-y-auto pr-1">
                                    {likedVideos.map((video, idx) => {
                                        const isSelected = activeIndex === idx;
                                        return (
                                            <div
                                                key={video.id}
                                                onClick={() => setTopActiveIndex(idx)}
                                                className={`group flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-kestrel-blue/5 border-kestrel-blue/40 shadow-xs translate-x-1'
                                                        : 'bg-white border-slate-100 hover:bg-slate-50'
                                                }`}
                                            >
                                                {/* Mini Thumbnail */}
                                                <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 shadow-xs">
                                                    <img
                                                        src={getThumbnailUrl(video)}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                                        <Play className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>

                                                {/* Title & Type tag */}
                                                <div className="min-w-0 flex-1">
                                                    <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-kestrel-blue' : 'text-slate-700'}`}>
                                                        {video.title}
                                                    </h5>
                                                    <span className="text-[9px] font-black uppercase text-slate-400 block mt-0.5">
                                                        {video.isUploaded ? 'Uploaded Clip' : 'YouTube Live'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="pt-2 border-t border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        Tip: To star/add more top videos, use the <span className="text-kestrel-blue underline cursor-pointer" onClick={() => {
                                            const sec = document.getElementById('media-showcase-section');
                                            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                                        }}>Omnichannel Media Center</span> downstairs!
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* Dynamic Video Chooser when nothing is starred/liked yet */
                    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-center shadow-xl animate-in fade-in duration-300">
                        <div className="max-w-md mx-auto space-y-3">
                            <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No Top Showcase Video Selected</h3>
                            <p className="text-xs text-slate-400">
                                This top player is configured to stream <span className="text-amber-400 font-semibold">only selected and starred videos</span> added within the <strong className="text-white">Kestrel Omnichannel Media Center</strong>.
                            </p>
                        </div>

                        {companyVideos.length > 0 ? (
                            <div className="mt-8 text-left space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                    Quick Select: Click a video's star flag below to pin it here:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {companyVideos.map((video) => (
                                        <div 
                                            key={video.id} 
                                            className="bg-slate-800/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col justify-between transition-colors"
                                        >
                                            <div>
                                                <h5 className="text-xs font-bold text-white truncate">{video.title}</h5>
                                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                                                    {video.description}
                                                </p>
                                                <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                                                    {video.isUploaded ? 'UPLOADED LOCAL CLIP' : 'YOUTUBE STREAM'}
                                                </span>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                                                <button
                                                    onClick={() => {
                                                        const updated = companyVideos.map(v => 
                                                            v.id === video.id ? { ...v, isLiked: true } : v
                                                        );
                                                        onUpdateVideos(updated);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[11px] font-black text-slate-950 transition-colors cursor-pointer"
                                                >
                                                    <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                                                    <span>Star & Play on Top</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const sec = document.getElementById('media-showcase-section');
                                                        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="text-[10px] text-slate-400 hover:text-white font-bold transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 bg-slate-950 rounded-xl p-6 border border-slate-800/50">
                                <p className="text-xs text-slate-500">Wait, your video catalog is completely empty! Please add or upload a video in the catalog.</p>
                                <button
                                    onClick={() => {
                                        const sec = document.getElementById('media-showcase-section');
                                        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-kestrel-teal hover:underline"
                                >
                                    <span>Scroll to Media Center to upload first video</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* About Section */}
            <section className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-12 text-center">About Kestrel AI Solution</h2>
                
                {/* History */}
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 relative group/history border border-dashed border-transparent hover:border-slate-200 p-4 rounded-xl transition-all">
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setEditingSection('history');
                                setEditForm({
                                    historyTitle: homeContent.historyTitle,
                                    historyText: homeContent.historyText,
                                    historyImage: homeContent.historyImage
                                });
                            }}
                            className="absolute top-2 right-2 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded border border-slate-200 shadow-sm flex items-center gap-1 z-10 cursor-pointer"
                        >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Edit History Info</span>
                        </button>
                    )}
                    <div className="order-2 md:order-1">
                        <h3 className="text-2xl font-semibold text-kestrel-blue mb-4">{homeContent.historyTitle}</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {homeContent.historyText}
                        </p>
                    </div>
                    <div className="order-1 md:order-2">
                        <img
                            src={homeContent.historyImage}
                            alt="Our History"
                            className="rounded-lg shadow-md w-full h-auto object-cover max-h-96"
                        />
                    </div>
                </div>

                {/* Team Section */}
                <TeamSection staff={staff} onUpdateStaff={onUpdateStaff} />

                {/* Gallery Section */}
                <GallerySection images={companyGallery} onUpdateImages={onUpdateGallery} />

                {/* Approach */}
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 relative group/approach border border-dashed border-transparent hover:border-slate-200 p-4 rounded-xl transition-all">
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setEditingSection('approach');
                                setEditForm({
                                    approachTitle: homeContent.approachTitle,
                                    approachText: homeContent.approachText,
                                    approachImage: homeContent.approachImage
                                });
                            }}
                            className="absolute top-2 right-2 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded border border-slate-200 shadow-sm flex items-center gap-1 z-10 cursor-pointer"
                        >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Edit Approach Info</span>
                        </button>
                    )}
                    <div className="order-1 md:order-2">
                        <h3 className="text-2xl font-semibold text-kestrel-blue mb-4">{homeContent.approachTitle}</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {homeContent.approachText}
                        </p>
                    </div>
                    <div className="order-2 md:order-1">
                        <img
                            src={homeContent.approachImage}
                            alt="Our Approach"
                            className="rounded-lg shadow-md w-full h-auto object-cover max-h-96"
                        />
                    </div>
                </div>

                {/* Services */}
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center relative group/services border border-dashed border-transparent hover:border-slate-200 p-4 rounded-xl transition-all">
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setEditingSection('servicesIntro');
                                setEditForm({
                                    servicesTitle: homeContent.servicesTitle,
                                    servicesText: homeContent.servicesText,
                                    servicesImage: homeContent.servicesImage
                                });
                            }}
                            className="absolute top-2 right-2 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded border border-slate-200 shadow-sm flex items-center gap-1 z-10 cursor-pointer"
                        >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Edit Services Intro</span>
                        </button>
                    )}
                    <div className="order-2 md:order-1">
                        <h3 className="text-2xl font-semibold text-kestrel-blue mb-4">{homeContent.servicesTitle}</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {homeContent.servicesText}
                        </p>
                    </div>
                    <div className="order-1 md:order-2">
                        <img
                            src={homeContent.servicesImage}
                            alt="Our Services"
                            className="rounded-lg shadow-md w-full h-auto object-cover max-h-96"
                        />
                    </div>
                </div>
            </section>

            {/* Our Offerings Section */}
            <section className="bg-slate-50 rounded-xl shadow-lg p-8 md:p-12 relative">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 border-b border-slate-200/60 pb-6">
                    <div className="text-center sm:text-left">
                        <h2 className="text-3xl font-bold text-slate-800">Our Offerings</h2>
                        <p className="text-xs text-slate-500 mt-1">Innovative and scalable capabilities created by Kestrel AI Solution</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                const newService = {
                                    title: `Dynamic Business Service 0${ourServices.length + 1}`,
                                    description: 'This is a new custom service offering description designed for optimizing your company\'s business operations seamlessly.',
                                    imageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                                };
                                const updated = [...ourServices, newService];
                                onUpdateOurServices(updated);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md text-sm font-bold cursor-pointer"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Add New Offering</span>
                        </button>
                    )}
                </div>

                <div className="space-y-16">
                    {paginatedServices.map((service, index) => {
                        const isReversed = index % 2 !== 0;
                        const absoluteIndex = servicesPage * servicesPerPage + index;
                        return (
                            <div key={service.title} className="grid md:grid-cols-2 gap-10 md:gap-16 items-center border border-dashed border-transparent hover:border-slate-200/80 p-4 rounded-xl transition-all relative group/offering">
                                <div className={`order-2 ${isReversed ? 'md:order-1' : 'md:order-2'}`}>
                                    <h3 className="text-2xl font-semibold text-kestrel-blue mb-4">{service.title}</h3>
                                    {Array.isArray(service.description) ? (
                                        <ul className="space-y-2">
                                            {service.description.map((item: string) => (
                                                <li key={item} className="flex items-start">
                                                    <Star className="w-5 h-5 text-kestrel-teal mr-3 mt-1 flex-shrink-0" />
                                                    <span className="text-slate-600 leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-slate-600 leading-relaxed">{service.description}</p>
                                    )}
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <button 
                                            onClick={scrollToContact}
                                            className="inline-block rounded-md bg-kestrel-teal px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors cursor-pointer"
                                        >
                                            Learn More
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingServiceIndex(absoluteIndex);
                                                        setEditForm({
                                                            title: service.title,
                                                            description: Array.isArray(service.description) ? service.description.join('\n') : service.description,
                                                            imageUrl: service.imageUrl
                                                        });
                                                    }}
                                                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                                    title="Edit service details"
                                                >
                                                    <EditIcon className="w-4 h-4 text-slate-500" />
                                                    <span>Edit Service</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete "${service.title}"?`)) {
                                                            const updated = ourServices.filter((_, idx) => idx !== absoluteIndex);
                                                            onUpdateOurServices(updated);
                                                            // If we deleted the last item on a page, return to previous page
                                                            if (updated.length > 0 && servicesPage * servicesPerPage >= updated.length) {
                                                                onServicePageChange(Math.max(0, servicesPage - 1));
                                                            }
                                                        }
                                                    }}
                                                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg cursor-pointer transition-colors"
                                                    aria-label="Delete Service"
                                                    title="Delete offering"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={`order-1 ${isReversed ? 'md:order-2' : 'md:order-1'}`}>
                                    <img
                                        src={service.imageUrl}
                                        alt={service.title}
                                        className="rounded-lg shadow-md w-full h-auto object-cover max-h-96"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-16 pt-8 border-t border-slate-200 space-x-4">
                    <button
                        onClick={() => onServicePageChange(servicesPage - 1)}
                        disabled={servicesPage === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {servicesPage + 1} of {totalServicePages}
                    </span>
                    <button
                        onClick={() => onServicePageChange(servicesPage + 1)}
                        disabled={servicesPage === totalServicePages - 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </section>

            {/* Transform Your Business Section */}
            <section className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Transform Your Business with Kestrel AI Solution</h2>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            At Kestrel AI Solution, we believe that the right software can transform your business. That's why we specialise in developing custom software applications that are tailored to the specific needs of your business. Our team of experienced developers and designers work with you every step of the way to ensure that your software is not only functional, but also beautiful and intuitive. Whether you need a mobile app, a web application, or desktop software, we have the expertise to make it happen.
                        </p>
                        <button
                            onClick={() => onNavigate('Projects')}
                            className="inline-block rounded-md bg-kestrel-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-kestrel-active-nav transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kestrel-blue">
                            Explore Our Solutions
                        </button>
                    </div>
                    <div>
                        <img
                            src="https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                            alt="Business Transformation with AI"
                            className="rounded-lg shadow-md w-full h-auto object-cover max-h-96"
                        />
                    </div>
                </div>
            </section>

            {/* YouTube Section */}
            <YouTubeSection videos={companyVideos} onUpdateVideos={onUpdateVideos} />

            {/* Our Aims Section */}
            <section className="bg-slate-50 rounded-xl shadow-lg p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Aims</h2>
                        <ul className="space-y-4 mb-8">
                            {[
                                'Identifying key societal issues for impactful solutions.',
                                'Commitment to delivering high-quality services.',
                                'Creating easily understandable programs with simple logic.',
                                'Collaborating effectively with other companies.',
                                'Timely delivery of projects adhering to company guidelines.'
                            ].map((aim, index) => (
                                <li key={index} className="flex items-start">
                                    <Lightbulb className="w-6 h-6 text-kestrel-teal mr-4 mt-1 flex-shrink-0" />
                                    <span className="text-slate-600 leading-relaxed">{aim}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={scrollToContact}
                            className="inline-block rounded-md bg-kestrel-teal px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kestrel-teal">
                            Work With Us
                        </button>
                    </div>
                    <div className="order-2 md:order-1">
                        <img
                            src="https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                            alt="Our Aims and Vision"
                            className="rounded-lg shadow-md w-full h-auto object-cover max-h-96"
                        />
                    </div>
                </div>
            </section>
            
            {/* Contact Us Section */}
            <section id="contact-us" className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800">Contact Us</h2>
                    <p className="text-slate-500 mt-2">We'd love to hear from you. Reach out for any inquiries.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="flex items-start">
                            <MapPin className="h-7 w-7 text-kestrel-blue mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Address</h3>
                                <p className="text-slate-600 mt-1 leading-relaxed">
                                    DNO.10-259, Plot No.16, Visalakshi Nagar,<br />
                                    Visakhapatnam, Andhra Pradesh, 530043<br />
                                    India.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Envelope className="h-7 w-7 text-kestrel-blue mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Email</h3>
                                <a href="mailto:eshwar@kestrelaisolutions.com" className="text-slate-600 mt-1 block hover:text-kestrel-blue transition-colors">1. eshwar@kestrelaisolutions.com</a>
                                <a href="mailto:eswarganta1985@gmail.com" className="text-slate-600 mt-1 block hover:text-kestrel-blue transition-colors">2. eswarganta1985@gmail.com</a>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Phone className="h-7 w-7 text-kestrel-blue mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Whatsapp Phone</h3>
                                <p className="text-slate-600 mt-1">+91 8897226495</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <form onSubmit={handleContactSubmit} method="POST" className="space-y-6">
                            <div>
                                <label htmlFor="name" className="sr-only">Name</label>
                                <input type="text" name="name" id="name" autoComplete="name" placeholder="Your Name" required className="block w-full rounded-md border-0 px-3.5 py-2 bg-slate-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kestrel-blue sm:text-sm sm:leading-6" />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input type="email" name="email" id="email" autoComplete="email" placeholder="Your Email" required className="block w-full rounded-md border-0 px-3.5 py-2 bg-slate-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kestrel-blue sm:text-sm sm:leading-6" />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">Message</label>
                                <textarea name="message" id="message" rows={4} placeholder="Your Message" required className="block w-full rounded-md border-0 px-3.5 py-2 bg-slate-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kestrel-blue sm:text-sm sm:leading-6"></textarea>
                            </div>
                            <div>
                                <button type="submit" className="flex w-full justify-center rounded-md bg-kestrel-blue px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-kestrel-active-nav focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kestrel-blue transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* CMS Edit Section Modal */}
            {editingSection && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden">
                        <div className="bg-kestrel-blue text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold capitalize">Edit {editingSection} Content</h3>
                            <button 
                                onClick={() => setEditingSection(null)} 
                                className="text-white/85 hover:text-white transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Title Field if applicable */}
                            {('heroTitle' in editForm || 'historyTitle' in editForm || 'approachTitle' in editForm || 'servicesTitle' in editForm) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Section Title</label>
                                    <input
                                        type="text"
                                        value={editForm.heroTitle || editForm.historyTitle || editForm.approachTitle || editForm.servicesTitle || ''}
                                        onChange={(e) => {
                                            const updatedKey = editingSection === 'hero' ? 'heroTitle' :
                                                               editingSection === 'history' ? 'historyTitle' :
                                                               editingSection === 'approach' ? 'approachTitle' : 'servicesTitle';
                                            setEditForm({ ...editForm, [updatedKey]: e.target.value });
                                        }}
                                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                        required
                                    />
                                </div>
                            )}

                            {/* Text / Subtitle Field */}
                            {('heroSubtitle' in editForm || 'historyText' in editForm || 'approachText' in editForm || 'servicesText' in editForm) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Section Content / Description</label>
                                    <textarea
                                        rows={5}
                                        value={editForm.heroSubtitle || editForm.historyText || editForm.approachText || editForm.servicesText || ''}
                                        onChange={(e) => {
                                            const updatedKey = editingSection === 'hero' ? 'heroSubtitle' :
                                                               editingSection === 'history' ? 'historyText' :
                                                               editingSection === 'approach' ? 'approachText' : 'servicesText';
                                            setEditForm({ ...editForm, [updatedKey]: e.target.value });
                                        }}
                                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                        required
                                    />
                                </div>
                            )}

                            {/* Image Media Url if applicable */}
                            {('historyImage' in editForm || 'approachImage' in editForm || 'servicesImage' in editForm) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Visual Image URL</label>
                                    <input
                                        type="text"
                                        value={editForm.historyImage || editForm.approachImage || editForm.servicesImage || ''}
                                        onChange={(e) => {
                                            const updatedKey = editingSection === 'history' ? 'historyImage' :
                                                               editingSection === 'approach' ? 'approachImage' : 'servicesImage';
                                            setEditForm({ ...editForm, [updatedKey]: e.target.value });
                                        }}
                                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                        required
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Provide a high-quality online unsplash/pexels image link or direct URL.</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onUpdateHomeContent({
                                        ...homeContent,
                                        ...editForm
                                    });
                                    setEditingSection(null);
                                }}
                                className="px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
                            >
                                <SaveIcon className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CMS Edit Offering Modal */}
            {editingServiceIndex !== null && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden">
                        <div className="bg-kestrel-blue text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Edit Offering Details</h3>
                            <button 
                                onClick={() => setEditingServiceIndex(null)} 
                                className="text-white/85 hover:text-white transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Offering Title</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (Separate list items by lines)</label>
                                <textarea
                                    rows={5}
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Enter complete description text or press Enter for bullet points"
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">For bulleted lists, write each point on a brand new line.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Icon / Image URL</label>
                                <input
                                    type="text"
                                    value={editForm.imageUrl || ''}
                                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEditingServiceIndex(null)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const updatedDesc = editForm.description.includes('\n') 
                                        ? editForm.description.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
                                        : editForm.description;
                                    const updated = ourServices.map((srv, idx) => {
                                        if (idx === editingServiceIndex) {
                                            return {
                                                ...srv,
                                                title: editForm.title,
                                                description: updatedDesc,
                                                imageUrl: editForm.imageUrl
                                            };
                                        }
                                        return srv;
                                    });
                                    onUpdateOurServices(updated);
                                    setEditingServiceIndex(null);
                                }}
                                className="px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
                            >
                                <SaveIcon className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeView;
