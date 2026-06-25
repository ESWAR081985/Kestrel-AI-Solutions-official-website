import React, { useState, useEffect } from 'react';
import { YouTubeVideo } from '../types';
import { Video, Plus, Trash2, Play, ExternalLink, Edit2, X, Star, Search, UploadCloud, Heart, Info, Check } from 'lucide-react';
import { saveVideoBlob, deleteVideoBlob } from '../utils/indexedDB';
import { useAuth } from '../contexts/AuthContext';

interface YouTubeSectionProps {
    videos: YouTubeVideo[];
    onUpdateVideos: (updatedVideos: YouTubeVideo[]) => void;
}

export const YouTubeSection: React.FC<YouTubeSectionProps> = ({ videos, onUpdateVideos }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(videos[0] || null);
    const [isPlayerLoading, setIsPlayerLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

    // Filter and Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'liked' | 'uploaded'>('all');

    // Tab inside Add Modal
    const [addTab, setAddTab] = useState<'youtube' | 'upload'>('youtube');

    // Form inputs (YouTube option)
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [formError, setFormError] = useState('');

    // Form inputs (Upload option)
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState('');

    // Edit inputs
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editUrl, setEditUrl] = useState('');

    // Curated Channel Presets for Quick Add
    const PRESET_VIDEOS = [
        {
            id: 'qp0HIF3SfI4',
            title: 'Kestrel Platform Overview',
            description: 'A deep-dive video illustrating how the AI Suite optimizes analytical structures and automates visual workflows securely.',
            url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4'
        },
        {
            id: 'dQw4w9WgXcQ',
            title: 'System Launch Demonstration',
            description: 'Comprehensive guided presentation showing off real-time pipeline activations and responsive customer interfaces.',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            id: 'yPYvS7bK0g0',
            title: 'Engineering Deep Dive',
            description: 'High-level exploration of database persistence models, lazy client initializations, and layout transition guidelines.',
            url: 'https://www.youtube.com/watch?v=yPYvS7bK0g0'
        }
    ];

    // Fallback if no selected video but feed has items
    useEffect(() => {
        if (!selectedVideo && videos.length > 0) {
            setSelectedVideo(videos[0]);
        }
    }, [videos, selectedVideo]);

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

    const handleSelectVideo = (video: YouTubeVideo) => {
        if (!video.isUploaded) {
            setIsPlayerLoading(true);
        }
        setSelectedVideo(video);
    };

    // Toggle Favorite / Like
    const toggleLikeVideo = (e: React.MouseEvent, targetVid: YouTubeVideo) => {
        e.stopPropagation();
        const updated = videos.map(v => {
            if (v.id === targetVid.id) {
                return { ...v, isLiked: !v.isLiked };
            }
            return v;
        });
        onUpdateVideos(updated);
        if (selectedVideo?.id === targetVid.id) {
            setSelectedVideo({ ...selectedVideo, isLiked: !selectedVideo.isLiked });
        }
    };

    // Add Video from Presets (Quick Add)
    const handleQuickAdd = (preset: typeof PRESET_VIDEOS[0]) => {
        // Prevent duplicate IDs
        if (videos.some(v => v.id === preset.id)) {
            alert('This preset is already in your feed.');
            return;
        }
        const newVid: YouTubeVideo = {
            id: preset.id,
            title: preset.title,
            description: preset.description,
            url: preset.url,
            isLiked: true
        };
        const updated = [...videos, newVid];
        onUpdateVideos(updated);
        setSelectedVideo(newVid);
    };

    // Form submission for YouTube Link
    const handleAddVideo = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        const ytId = getYouTubeId(newUrl);
        if (!ytId) {
            setFormError('Please enter a valid YouTube video URL containing an 11-digit video ID.');
            return;
        }

        const newVideo: YouTubeVideo = {
            id: ytId,
            title: newTitle.trim() || 'Untitled Video',
            description: newDesc.trim() || 'No description provided.',
            url: newUrl.trim()
        };

        const updated = [...videos, newVideo];
        onUpdateVideos(updated);
        setSelectedVideo(newVideo);
        
        // Reset and close
        setNewTitle('');
        setNewDesc('');
        setNewUrl('');
        setIsAddModalOpen(false);
    };

    // Form submission for uploaded local file
    const handleLocalUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError('');

        if (!uploadedFile) {
            setUploadError('Please select a local video file to upload.');
            return;
        }

        try {
            const randId = 'upload_' + Date.now();
            
            // Save the raw file blob into IndexedDB
            await saveVideoBlob(randId, uploadedFile);

            // Generate temporary object URL which exists for the duration of the browser session
            const localUrl = URL.createObjectURL(uploadedFile);

            const newVideo: YouTubeVideo = {
                id: randId,
                title: uploadTitle.trim() || uploadedFile.name,
                description: uploadDesc.trim() || `Local media file: ${uploadedFile.name}`,
                url: localUrl,
                isUploaded: true,
                localVideoUrl: localUrl
            };

            const updated = [...videos, newVideo];
            onUpdateVideos(updated);
            setSelectedVideo(newVideo);

            // Reset
            setUploadTitle('');
            setUploadDesc('');
            setUploadedFile(null);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Failed to save file to IndexedDB:', error);
            setUploadError('Failed to save the video file locally. Please try again.');
        }
    };

    const handleDeleteVideo = async (e: React.MouseEvent, vidId: string) => {
        e.stopPropagation();
        const updated = videos.filter(v => v.id !== vidId);
        onUpdateVideos(updated);
        
        // Pick a fallback selected video
        if (selectedVideo?.id === vidId) {
            setSelectedVideo(updated[0] || null);
        }

        // Remove from IndexedDB if it was an uploaded file
        if (vidId.startsWith('upload_')) {
            try {
                await deleteVideoBlob(vidId);
            } catch (err) {
                console.error('Failed to delete video blob:', err);
            }
        }
    };

    const startEditing = (e: React.MouseEvent, video: YouTubeVideo) => {
        e.stopPropagation();
        setEditingVideoId(video.id);
        setEditTitle(video.title);
        setEditDesc(video.description);
        setEditUrl(video.url);
        setIsEditMode(true);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVideoId) return;

        const isCurrentUploaded = selectedVideo?.id === editingVideoId && selectedVideo.isUploaded;

        if (!isCurrentUploaded) {
            const ytId = getYouTubeId(editUrl);
            if (!ytId) {
                alert('Please enter a valid YouTube URL containing an 11-digit ID.');
                return;
            }

            const updated = videos.map(v => {
                if (v.id === editingVideoId) {
                    return {
                        ...v,
                        id: ytId,
                        title: editTitle.trim(),
                        description: editDesc.trim(),
                        url: editUrl.trim()
                    };
                }
                return v;
            });

            onUpdateVideos(updated);
            const selectedMatch = updated.find(v => v.id === ytId);
            if (selectedMatch) {
                setSelectedVideo(selectedMatch);
            }
        } else {
            // Uploaded video edit doesn't require YouTube ID
            const updated = videos.map(v => {
                if (v.id === editingVideoId) {
                    return {
                        ...v,
                        title: editTitle.trim(),
                        description: editDesc.trim()
                    };
                }
                return v;
            });
            onUpdateVideos(updated);
            const selectedMatch = updated.find(v => v.id === editingVideoId);
            if (selectedMatch) {
                setSelectedVideo(selectedMatch);
            }
        }

        setIsEditMode(false);
        setEditingVideoId(null);
    };

    // Filter logic
    const filteredVideos = videos.filter(video => {
        const matchesQuery = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             video.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeFilter === 'liked') {
            return matchesQuery && video.isLiked;
        }
        if (activeFilter === 'uploaded') {
            return matchesQuery && video.isUploaded;
        }
        return matchesQuery;
    });

    const selectedYtId = selectedVideo && !selectedVideo.isUploaded ? getYouTubeId(selectedVideo.url) : null;

    return (
        <section id="media-showcase-section" className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16 border border-slate-100">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-6">
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 flex items-center gap-2.5">
                        <Video className="w-8 h-8 text-kestrel-blue" />
                        Kestrel Omnichannel Media Center
                    </h3>
                    <p className="text-slate-500 mt-1">
                        Review uploaded digital recordings, stream high-fidelity video tutorials, and import files straight from your channels.
                    </p>
                </div>
                
                {isAdmin && (
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-lg bg-kestrel-blue px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-600 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4.5 h-4.5" />
                            <span>Add & Upload Media</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Curated Feed templates row before stream selection */}
            <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Recommended Video Presets (Liked By Kestrel Staff)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRESET_VIDEOS.map((preset) => {
                        const isAdded = videos.some(v => v.id === preset.id);
                        return (
                            <div key={preset.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-800 truncate">{preset.title}</h5>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">{preset.description}</p>
                                </div>
                                <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Channel Demo</span>
                                    {isAdded ? (
                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded">
                                            <Check className="w-3 h-3" /> Added
                                        </span>
                                    ) : isAdmin ? (
                                        <button
                                            onClick={() => handleQuickAdd(preset)}
                                            className="text-[10px] font-bold text-kestrel-blue hover:text-blue-700 flex items-center gap-1 hover:underline pointer-events-auto"
                                        >
                                            <Plus className="w-3 h-3" /> Quick Add
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                            Kestrel Curated
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {videos.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No media content found in database feed.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 text-kestrel-blue font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                        <Plus className="w-4 h-4" /> Import your first video recording or stream
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Active Player Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {selectedVideo ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {/* Video Player Card */}
                                <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200">
                                    {selectedVideo.isUploaded ? (
                                        /* Local Video HTML5 Player */
                                        <video
                                            key={selectedVideo.id}
                                            controls
                                            autoPlay
                                            className="w-full h-full bg-black object-contain focus:outline-none"
                                            src={selectedVideo.localVideoUrl || selectedVideo.url}
                                        />
                                    ) : selectedYtId ? (
                                        /* YouTube embed screen */
                                        <>
                                            {isPlayerLoading && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
                                                    <div className="relative flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-kestrel-teal border-r-transparent border-b-transparent border-l-transparent"></div>
                                                        <div className="absolute animate-ping h-8 w-8 rounded-full bg-kestrel-teal/20"></div>
                                                    </div>
                                                    <span className="text-white text-sm font-semibold mt-4 tracking-wider">Acquiring Stream Feed Direct...</span>
                                                    <span className="text-slate-400 text-xs mt-1">Connecting YouTube player</span>
                                                </div>
                                            )}
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${selectedYtId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
                                                title={selectedVideo.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                onLoad={() => setIsPlayerLoading(false)}
                                            ></iframe>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 border">
                                            <Info className="w-12 h-12 mb-3 text-slate-600" />
                                            <span>Stream URL missing proper configurations</span>
                                        </div>
                                    )}
                                </div>

                                {/* Active Video Metadata */}
                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-kestrel-blue"></div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                                                    selectedVideo.isUploaded ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {selectedVideo.isUploaded ? 'Local Recording' : 'YouTube Stream'}
                                                </span>
                                                {selectedVideo.isLiked && (
                                                    <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-200">
                                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Starred
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-2xl font-bold text-slate-800 leading-snug pt-1">{selectedVideo.title}</h4>
                                        </div>
                                        {isAdmin && (
                                            <button
                                            onClick={(e) => toggleLikeVideo(e, selectedVideo)}
                                            className={`p-2.5 rounded-lg border transition-all ${
                                                selectedVideo.isLiked
                                                ? 'bg-amber-50 border-amber-300 text-amber-600'
                                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                            }`}
                                            title={selectedVideo.isLiked ? 'Starred Video' : 'Add to favorites'}
                                        >
                                            <Star className={`w-5 h-5 ${selectedVideo.isLiked ? 'fill-amber-500' : ''}`} />
                                        </button>
                                        )}
                                    </div>
                                    <p className="text-slate-600 mt-4 text-sm leading-relaxed whitespace-pre-line border-t border-slate-200/50 pt-4">
                                        {selectedVideo.description}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between">
                                        {selectedVideo.isUploaded ? (
                                            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                                <Info className="w-3.5 h-3.5 text-purple-400" /> Appointed local database streaming object.
                                            </div>
                                        ) : (
                                            <a
                                                href={selectedVideo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-kestrel-blue hover:text-blue-700 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>Watch Live on YouTube</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-900 rounded-xl text-white p-8">
                                <Video className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
                                <span className="font-bold text-lg text-slate-300">Select a Stream Pipeline</span>
                                <span className="text-slate-500 text-xs mt-1">Specify a feed from the sidebar directory to trigger active video streaming</span>
                            </div>
                        )}
                    </div>

                    {/* Media Directory Sidebar */}
                    <div className="space-y-4">
                        {/* Feed Filter Panel */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                <span>Media Directory</span>
                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                    {filteredVideos.length} of {videos.length} feeds
                                </span>
                            </h4>
                            
                            {/* Search bar inside Sidebar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search feed catalog..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            {/* View Filter Tags */}
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                                        activeFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    All ({videos.length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('liked')}
                                    className={`flex-1 py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-0.5 ${
                                        activeFilter === 'liked' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Starred ({videos.filter(v => v.isLiked).length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('uploaded')}
                                    className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                                        activeFilter === 'uploaded' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Uploaded ({videos.filter(v => v.isUploaded).length})
                                </button>
                            </div>
                        </div>
                        
                        {/* Stream List Grid */}
                        <div className="space-y-2.5 max-h-[32rem] overflow-y-auto pr-1">
                            {filteredVideos.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/55 p-4">
                                    No records match this filtering selection.
                                </div>
                            ) : (
                                filteredVideos.map((vid) => {
                                    const isActive = selectedVideo?.id === vid.id;
                                    return (
                                        <div
                                            key={vid.id}
                                            onClick={() => handleSelectVideo(vid)}
                                            className={`group relative flex gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                                isActive
                                                ? 'bg-kestrel-blue/5 border-kestrel-blue/30 shadow-md translate-x-1'
                                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {/* Thumbnail Container */}
                                            <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950 shadow-sm">
                                                <img
                                                    src={getThumbnailUrl(vid)}
                                                    alt={vid.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-all">
                                                    <Play className={`w-5 h-5 text-white ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(30,58,138,0.7)]' : ''}`} />
                                                </div>
                                                {vid.isLiked && (
                                                    <div className="absolute top-1 left-1 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow-sm">
                                                        <Star className="w-2 h-2 fill-slate-900 text-slate-900" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Meta Description */}
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="flex items-center gap-1.5">
                                                    <h5 className={`text-xs font-bold truncate ${isActive ? 'text-kestrel-blue' : 'text-slate-800'} transition-colors`}>
                                                        {vid.title}
                                                    </h5>
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5 flex items-center gap-1 uppercase">
                                                    {vid.isUploaded ? (
                                                        <span className="text-purple-600 bg-purple-50 px-1 rounded-sm">Uploaded Clip</span>
                                                    ) : (
                                                        <span className="text-red-600 bg-red-50 px-1 rounded-sm">YouTube ID: {getYouTubeId(vid.url)}</span>
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                                                    {vid.description}
                                                </p>
                                            </div>

                                            {/* Operations (Star / Edit / Delete) */}
                                            {isAdmin && (
                                                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    onClick={(e) => toggleLikeVideo(e, vid)}
                                                    className={`p-1 rounded border shadow-sm transition-all text-slate-400 ${
                                                        vid.isLiked ? 'bg-amber-50 border-amber-200 text-amber-500 hover:text-amber-600' : 'bg-white border-slate-200 hover:text-slate-700'
                                                    }`}
                                                    title={vid.isLiked ? 'Remove star' : 'Star stream'}
                                                >
                                                    <Star className={`w-3 h-3 ${vid.isLiked ? 'fill-amber-400' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={(e) => startEditing(e, vid)}
                                                    className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-1 rounded border border-slate-200 transition-all shadow-sm"
                                                    title="Edit stream metadata"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteVideo(e, vid.id)}
                                                    className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 p-1 rounded border border-slate-200 transition-all shadow-sm"
                                                    title="Delete stream"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Add New Video Stream or Upload Local file */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Video className="w-5 h-5 text-kestrel-blue" />
                                Add Video to Media Channel
                            </h4>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modals Option Selectors */}
                        <div className="flex border-b border-slate-100 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-500">
                            <button
                                onClick={() => setAddTab('youtube')}
                                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                                    addTab === 'youtube'
                                        ? 'border-kestrel-blue text-kestrel-blue bg-white'
                                        : 'border-transparent hover:text-slate-805 hover:bg-slate-100/50'
                                }`}
                            >
                                Import YouTube Link
                            </button>
                            <button
                                onClick={() => setAddTab('upload')}
                                className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                                    addTab === 'upload'
                                        ? 'border-kestrel-blue text-kestrel-blue bg-white'
                                        : 'border-transparent hover:text-slate-805 hover:bg-slate-100/50'
                                }`}
                            >
                                <UploadCloud className="w-4 h-4" />
                                Upload Local File
                            </button>
                        </div>
                        
                        {addTab === 'youtube' ? (
                            <form onSubmit={handleAddVideo} className="p-6 space-y-4">
                                {formError && (
                                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg font-semibold leading-relaxed border border-red-200">
                                        {formError}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">YouTube URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="e.g. https://www.youtube.com/watch?v=qp0HIF3SfI4"
                                        value={newUrl}
                                        onChange={e => setNewUrl(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    />
                                    <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">Accepts standard watch link formats containing the video identifier ID.</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Video Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Kestrel AI Platform Demo"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Enter summaries, links, and presenter logs..."
                                        value={newDesc}
                                        onChange={e => setNewDesc(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-kestrel-blue text-white hover:bg-blue-600 transition-colors shadow-sm"
                                    >
                                        Import Stream
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleLocalUpload} className="p-6 space-y-4">
                                {uploadError && (
                                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg font-semibold leading-relaxed border border-red-200 border-dashed">
                                        {uploadError}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Select Video File</label>
                                    <div className="border-2 border-dashed border-slate-200 hover:border-kestrel-blue rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setUploadedFile(e.target.files[0]);
                                                    if (!uploadTitle) {
                                                        setUploadTitle(e.target.files[0].name.split('.')[0]);
                                                    }
                                                }
                                            }}
                                        />
                                        <UploadCloud className="w-9 h-9 text-slate-400 mx-auto mb-2" />
                                        <div className="text-xs font-bold text-slate-700">
                                            {uploadedFile ? uploadedFile.name : 'Click to select or drag video file here'}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Supports MP4, WebM, or OGG recording clips.</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Video Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sales Onboarding Video"
                                        value={uploadTitle}
                                        onChange={e => setUploadTitle(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description / Logs</label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Add descriptive logs, timestamps or internal notes..."
                                        value={uploadDesc}
                                        onChange={e => setUploadDesc(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-kestrel-blue text-white hover:bg-blue-600 transition-colors shadow-sm"
                                    >
                                        Attach Media Clip
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Modal - Edit Video Stream */}
            {isEditMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditMode(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-kestrel-blue" />
                                Edit Video Parameters
                            </h4>
                            <button onClick={() => setIsEditMode(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            {/* Only stream URLs can edit video URL link */}
                            {!(selectedVideo?.isUploaded) && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Video Stream URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={editUrl}
                                        onChange={e => setEditUrl(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Video Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditMode(false); setEditingVideoId(null); }}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-kestrel-blue text-white hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};
