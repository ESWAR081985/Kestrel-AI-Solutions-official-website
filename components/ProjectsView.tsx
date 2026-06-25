import React, { useState, useMemo, useRef } from 'react';
import { Project, Milestone } from '../types';
import { ChevronUpDownIcon, XMarkIcon, PlusIcon, TrashIcon } from './Icons';
import { fileToDataUrl, resizeImage } from '../utils/imageUtils';
import { LayoutGrid, Calendar, ChevronLeft, ChevronRight, ExternalLink, Video, Maximize2, Minimize2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO, addMonths, subMonths, differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface ProjectsViewProps {
    projects: Project[];
    onUpdateProjects: (updatedProjects: Project[]) => void;
}

type SortKey = 'title' | 'client' | 'type';
type SortOrder = 'asc' | 'desc';

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onUpdateProjects }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [sortBy, setSortBy] = useState<SortKey>('title');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProject, setEditProject] = useState<Partial<Project>>({});
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<Project['status'] | 'All'>('All');
    const [filterType, setFilterType] = useState<Project['type'] | 'All'>('All');
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
    const [timelineDate, setTimelineDate] = useState(new Date());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Manage Inline Expansion/Collapse States for Project Cards
    const [collapsedProjectIds, setCollapsedProjectIds] = useState<Record<string | number, boolean>>({});
    const [isModalMaximized, setIsModalMaximized] = useState(false);

    const handleExpandAll = () => {
        setCollapsedProjectIds({});
    };

    const handleCollapseAll = () => {
        const newCollapsed: Record<string | number, boolean> = {};
        projects.forEach(p => {
            newCollapsed[p.id] = true;
        });
        setCollapsedProjectIds(newCollapsed);
    };

    const toggleProjectExpand = (projectId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedProjectIds(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    // Form state for new project
    const [newProject, setNewProject] = useState<Partial<Project>>({
        title: '',
        client: '',
        type: 'service',
        status: 'Not Started',
        description: '',
        technologies: [],
        features: [],
        milestones: [],
        imageUrl: 'https://picsum.photos/seed/kestrel-project/800/600',
        valueProposition: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
        deployedUrl: '',
        demoVideoUrl: ''
    });

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-150/90 text-emerald-800 border-emerald-300/40 font-bold';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300/60 font-bold';
            case 'On Hold': return 'bg-amber-100 text-amber-800 border-amber-300/60 font-bold';
            case 'Not Started': return 'bg-slate-100 text-slate-600 border-slate-300/60 font-bold';
            default: return 'bg-slate-100 text-slate-600 border-slate-300/60 font-bold';
        }
    };

    const getMilestoneStatusColor = (status: Milestone['status']) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Pending': return 'bg-slate-100 text-slate-600';
            case 'Delayed': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const calculateProgress = (project: Project | Partial<Project>) => {
        if (project.status === 'Completed') return 100;
        if (!project.milestones || project.milestones.length === 0) {
            if (project.status === 'In Progress') return 25;
            if (project.status === 'On Hold') return 10;
            return 0;
        }
        
        const completed = project.milestones.filter(m => m.status === 'Completed').length;
        return Math.round((completed / project.milestones.length) * 100);
    };

    const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
        const [isPlayerLoading, setIsPlayerLoading] = useState(true);
        const [isPlayerPlaying, setIsPlayerPlaying] = useState(true);
        const [isPlayerMuted, setIsPlayerMuted] = useState(false);
        const playerVideoRef = useRef<HTMLVideoElement>(null);

        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        
        const getYouTubeId = (link: string) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = link.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };

        const ytId = isYouTube ? getYouTubeId(url) : null;

        React.useEffect(() => {
            setIsPlayerLoading(true);
        }, [url]);

        if (isYouTube && ytId) {
            return (
                <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-200">
                    {isPlayerLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-kestrel-blue border-t-transparent mb-2"></div>
                            <span className="text-white text-xs">Loading YouTube Demo...</span>
                        </div>
                    )}
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setIsPlayerLoading(false)}
                    ></iframe>
                </div>
            );
        }

        const isGif = url.match(/\.(gif)$/i);

        if (isGif) {
            return (
                <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                    {isPlayerLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-kestrel-teal border-t-transparent mb-2"></div>
                            <span className="text-white text-xs">Loading GIF Preview...</span>
                        </div>
                    )}
                    <img 
                        src={url}
                        alt="GIF Demo"
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                        onLoad={() => setIsPlayerLoading(false)}
                    />
                </div>
            );
        }

        return (
            <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center group/fullplayer">
                {isPlayerLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-kestrel-blue border-t-transparent mb-2"></div>
                        <span className="text-white text-xs">Loading Video...</span>
                    </div>
                )}
                
                <video
                    ref={playerVideoRef}
                    src={url}
                    autoPlay={isPlayerPlaying}
                    loop
                    muted={isPlayerMuted}
                    playsInline
                    className="w-full h-full object-contain"
                    onLoadStart={() => setIsPlayerLoading(true)}
                    onWaiting={() => setIsPlayerLoading(true)}
                    onPlaying={() => setIsPlayerLoading(false)}
                    onCanPlay={() => setIsPlayerLoading(false)}
                />

                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/fullplayer:opacity-100 transition-opacity flex items-center justify-between z-10 text-white">
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (playerVideoRef.current) {
                                    if (isPlayerPlaying) {
                                        playerVideoRef.current.pause();
                                        setIsPlayerPlaying(false);
                                    } else {
                                        playerVideoRef.current.play().catch(() => {});
                                        setIsPlayerPlaying(true);
                                    }
                                }
                            }}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors focus:outline-none"
                            title={isPlayerPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlayerPlaying ? (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (playerVideoRef.current) {
                                    const nextMute = !isPlayerMuted;
                                    playerVideoRef.current.muted = nextMute;
                                    setIsPlayerMuted(nextMute);
                                }
                            }}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors focus:outline-none"
                            title={isPlayerMuted ? 'Unmute' : 'Mute'}
                        >
                            {isPlayerMuted ? (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-8 5.77H3v6h3l5 5V4L6 9z" className="opacity-60" />
                                    <path d="M19 12a6.96 6.96 0 0 1-1.37 4.14l1.48 1.48A8.93 8.93 0 0 0 21 12a9 9 0 0 0-9-9v2a6.99 6.99 0 0 1 7 7zm-7 9v-2a7 7 0 0 1-4.14-1.37L6.38 20.1C7.94 21.3 9.89 22 12 22zm-7.62-5.7l1.45-1.45A3.98 3.98 0 0 1 5 12c0-1.38.7-2.6 1.83-3.3L5.38 7.2A5.96 5.96 0 0 0 3 12c0 1.63.66 3.1 1.38 4.3z" />
                                    <path d="M4.27 3L3 4.27l16.73 16.73L21 19.73L4.27 3z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ProjectPreview: React.FC<{ project: Project }> = ({ project }) => {
        const [isHovered, setIsHovered] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const [isPlaying, setIsPlaying] = useState(true);
        const [isMuted, setIsMuted] = useState(true);
        const videoRef = useRef<HTMLVideoElement>(null);
        
        const getPreviewUrl = () => {
            if (project.demoVideoUrl?.match(/\.(mp4|webm|ogg)$/i)) return project.demoVideoUrl;
            if (project.demoVideoUrl?.match(/\.(gif)$/i)) return project.demoVideoUrl;
            if (project.deployedUrl?.match(/\.(gif)$/i)) return project.deployedUrl;
            
            return `https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6rO/giphy.gif`;
        };

        const previewUrl = getPreviewUrl();
        const isVideo = previewUrl.match(/\.(mp4|webm|ogg)$/i);

        React.useEffect(() => {
            if (!isHovered) {
                setIsLoading(true);
                setIsPlaying(true);
            }
        }, [isHovered]);

        return (
            <div 
                className="aspect-video relative overflow-hidden bg-slate-900 cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-30 blur-sm' : 'scale-100 opacity-100'}`}
                    referrerPolicy="no-referrer"
                    onLoad={() => setIsLoading(false)}
                />
                
                {isHovered && (
                    <div className="absolute inset-0 transition-opacity duration-300">
                        {isVideo ? (
                            <div className="relative w-full h-full">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-kestrel-blue border-t-transparent"></div>
                                        <span className="text-white text-xs ml-2 font-medium">Loading video...</span>
                                    </div>
                                )}
                                <video 
                                    ref={videoRef}
                                    src={previewUrl}
                                    autoPlay={isPlaying}
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    className="w-full h-full object-cover"
                                    onLoadStart={() => setIsLoading(true)}
                                    onWaiting={() => setIsLoading(true)}
                                    onCanPlay={() => setIsLoading(false)}
                                    onPlaying={() => setIsLoading(false)}
                                />
                                
                                <div className="absolute bottom-2 left-2 flex items-center space-x-2 z-20 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (videoRef.current) {
                                                if (isPlaying) {
                                                    videoRef.current.pause();
                                                    setIsPlaying(false);
                                                } else {
                                                    videoRef.current.play().catch(() => {});
                                                    setIsPlaying(true);
                                                }
                                            }
                                        }}
                                        className="text-white hover:text-kestrel-blue transition-colors focus:outline-none"
                                    >
                                        {isPlaying ? (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                        ) : (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (videoRef.current) {
                                                const nextMute = !isMuted;
                                                videoRef.current.muted = nextMute;
                                                setIsMuted(nextMute);
                                            }
                                        }}
                                        className="text-white hover:text-kestrel-blue transition-colors focus:outline-none"
                                    >
                                        {isMuted ? (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-8 5.77H3v6h3l5 5V4L6 9z" className="opacity-60" />
                                                <path d="M19 12a6.96 6.96 0 0 1-1.37 4.14l1.48 1.48A8.93 8.93 0 0 0 21 12a9 9 0 0 0-9-9v2a6.99 6.99 0 0 1 7 7zm-7 9v-2a7 7 0 0 1-4.14-1.37L6.38 20.1C7.94 21.3 9.89 22 12 22zm-7.62-5.7l1.45-1.45A3.98 3.98 0 0 1 5 12c0-1.38.7-2.6 1.83-3.3L5.38 7.2A5.96 5.96 0 0 0 3 12c0 1.63.66 3.1 1.38 4.3z" />
                                                <path d="M4.27 3L3 4.27l16.73 16.73L21 19.73L4.27 3z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-kestrel-teal border-t-transparent"></div>
                                        <span className="text-white text-xs ml-2 font-medium">Loading preview...</span>
                                    </div>
                                )}
                                <img 
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onLoad={() => setIsLoading(false)}
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-kestrel-blue/10 pointer-events-none" />
                    </div>
                )}

                <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                    {isAdmin && (
                        <button 
                            onClick={(e) => handleDeleteClick(e, project)}
                            className="bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-all shadow-sm backdrop-blur-sm group/delete"
                            title="Delete Project"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                    <div className="bg-kestrel-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {project.type}
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                        {project.status}
                    </div>
                </div>
            </div>
        );
    };

    const filteredAndSortedProjects = useMemo(() => {
        let result = [...projects];

        // Apply filters
        if (filterStatus !== 'All') {
            result = result.filter(p => p.status === filterStatus);
        }
        if (filterType !== 'All') {
            result = result.filter(p => p.type === filterType);
        }

        // Apply sorting
        return result.sort((a, b) => {
            const aValue = (a[sortBy] || '').toString().toLowerCase();
            const bValue = (b[sortBy] || '').toString().toLowerCase();

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [projects, sortBy, sortOrder, filterStatus, filterType]);

    const handleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    const closeModal = () => {
        setSelectedProject(null);
        setIsEditing(false);
        setEditProject({});
        setIsModalMaximized(false);
    };

    const handleEditClick = () => {
        if (selectedProject) {
            setEditProject(selectedProject);
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditProject({});
    };

    const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
            onUpdateProjects(updatedProjects);
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleUpdateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProject && editProject) {
            const updatedProjects = projects.map(p => 
                p.id === selectedProject.id ? { ...p, ...editProject } as Project : p
            );
            onUpdateProjects(updatedProjects);
            setSelectedProject({ ...selectedProject, ...editProject } as Project);
            setIsEditing(false);
            setEditProject({});
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const dataUrl = await fileToDataUrl(file);
            const resizedDataUrl = await resizeImage(dataUrl, 800, 500, 0.7);
            
            if (isEdit) {
                setEditProject(prev => ({ ...prev, imageUrl: resizedDataUrl }));
            } else {
                setNewProject(prev => ({ ...prev, imageUrl: resizedDataUrl }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to process image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        const projectToAdd: Project = {
            ...newProject as Project,
            id: Date.now(),
            imageUrl: newProject.imageUrl || `https://picsum.photos/seed/${Date.now()}/800/600`
        };
        onUpdateProjects([...projects, projectToAdd]);
        setIsCreateModalOpen(false);
        setNewProject({
            title: '',
            client: '',
            type: 'service',
            status: 'Not Started',
            description: '',
            technologies: [],
            features: [],
            milestones: [],
            imageUrl: 'https://picsum.photos/seed/kestrel-project/800/600',
            valueProposition: '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd')
        });
    };

    const TimelineView = () => {
        const months = useMemo(() => {
            const start = subMonths(timelineDate, 2);
            const end = addMonths(timelineDate, 3);
            return eachMonthOfInterval({ start, end });
        }, [timelineDate]);

        const totalDays = useMemo(() => {
            const start = startOfMonth(months[0]);
            const end = endOfMonth(months[months.length - 1]);
            return differenceInDays(end, start) + 1;
        }, [months]);

        const getProjectPosition = (project: Project) => {
            if (!project.startDate || !project.endDate) return null;
            
            const timelineStart = startOfMonth(months[0]);
            const timelineEnd = endOfMonth(months[months.length - 1]);
            
            const projectStart = parseISO(project.startDate);
            const projectEnd = parseISO(project.endDate);

            // Check if project overlaps with current timeline view
            const isOverlapping = (
                (projectStart <= timelineEnd && projectEnd >= timelineStart)
            );

            if (!isOverlapping) return null;

            const startOffset = Math.max(0, differenceInDays(projectStart, timelineStart));
            const duration = differenceInDays(
                projectEnd > timelineEnd ? timelineEnd : projectEnd,
                projectStart < timelineStart ? timelineStart : projectStart
            ) + 1;

            return {
                left: `${(startOffset / totalDays) * 100}%`,
                width: `${(duration / totalDays) * 100}%`
            };
        };

        return (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setTimelineDate(subMonths(timelineDate, 1))}
                            className="p-2 hover:bg-white rounded-full shadow-sm border border-slate-200 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h3 className="text-lg font-bold text-slate-800 min-w-[150px] text-center">
                            {format(timelineDate, 'MMMM yyyy')}
                        </h3>
                        <button 
                            onClick={() => setTimelineDate(addMonths(timelineDate, 1))}
                            className="p-2 hover:bg-white rounded-full shadow-sm border border-slate-200 transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm font-semibold">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-slate-500 text-xs">Completed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <span className="text-slate-500 text-xs">In Progress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-slate-500 text-xs">On Hold</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[1000px] relative">
                        {/* Timeline Header (Months) */}
                        <div className="flex border-b border-slate-100">
                            <div className="w-64 flex-shrink-0 p-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-r border-slate-100 bg-slate-50/30">
                                Project Name
                            </div>
                            <div className="flex-1 flex">
                                {months.map((month, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex-1 p-4 text-center border-r border-slate-50 last:border-r-0"
                                    >
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                            {format(month, 'MMM')}
                                        </span>
                                        <span className="text-[10px] block text-slate-300 font-medium">
                                            {format(month, 'yyyy')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Rows */}
                        <div className="divide-y divide-slate-50">
                            {filteredAndSortedProjects.map((project) => {
                                const pos = getProjectPosition(project);
                                return (
                                    <div key={project.id} className="flex group hover:bg-slate-50/50 transition-colors">
                                        <div 
                                            onClick={() => setSelectedProject(project)}
                                            className="w-64 flex-shrink-0 p-4 border-r border-slate-100 cursor-pointer flex flex-col justify-center"
                                        >
                                            <div className="flex items-center justify-between gap-2 min-w-0">
                                                <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-kestrel-blue transition-colors flex-1" title={project.title}>
                                                    {project.title}
                                                </h4>
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] border flex-shrink-0 uppercase tracking-wider ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                                {project.client}
                                            </p>
                                        </div>
                                        <div className="flex-1 relative h-16 flex items-center px-2">
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 flex">
                                                {months.map((_, idx) => (
                                                    <div key={idx} className="flex-1 border-r border-slate-50 last:border-r-0"></div>
                                                ))}
                                            </div>
                                            
                                            {/* Project Bar */}
                                            {pos && (
                                                <div 
                                                    onClick={() => setSelectedProject(project)}
                                                    className={`absolute h-8 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md flex items-center px-3 overflow-hidden group/bar ${
                                                        project.status === 'Completed' ? 'bg-emerald-500 text-white' :
                                                        project.status === 'In Progress' ? 'bg-yellow-400 text-yellow-950 font-bold' :
                                                        project.status === 'On Hold' ? 'bg-amber-500 text-white' :
                                                        'bg-slate-400 text-white'
                                                    }`}
                                                    style={{ left: pos.left, width: pos.width }}
                                                >
                                                    {/* Progress Overlay */}
                                                    <div 
                                                        className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-500"
                                                        style={{ width: `${calculateProgress(project)}%` }}
                                                    />
                                                    <span className="relative z-10 text-[10px] font-bold truncate drop-shadow-sm">
                                                        {calculateProgress(project)}% • {format(parseISO(project.startDate!), 'MMM d')} - {format(parseISO(project.endDate!), 'MMM d')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h2 className="text-3xl font-bold text-slate-800">Our Innovative Projects</h2>
                    <p className="text-slate-500 mt-2">Showcasing our expertise in AI and software development.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${
                                viewMode === 'grid' 
                                ? 'bg-kestrel-blue text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`p-2 rounded-md transition-all ${
                                viewMode === 'timeline' 
                                ? 'bg-kestrel-blue text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="Timeline View"
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Expand/Collapse All Inline Controls */}
                    {viewMode === 'grid' && (
                        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-100 items-center">
                            <button
                                onClick={handleExpandAll}
                                className={`px-3 py-1.5 text-xs font-black rounded-md transition-all flex items-center space-x-1.5 hover:bg-slate-50 text-slate-700 hover:text-kestrel-blue cursor-pointer`}
                                title="Expand All Projects Inline"
                            >
                                <svg className="w-4 h-4 text-kestrel-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h18M3 13.5h18m-18 4.5h14.25" />
                                </svg>
                                <span>Expand All</span>
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <button
                                onClick={handleCollapseAll}
                                className={`px-3 py-1.5 text-xs font-black rounded-md transition-all flex items-center space-x-1.5 hover:bg-slate-50 text-slate-700 hover:text-kestrel-blue cursor-pointer`}
                                title="Collapse All Projects Inline"
                            >
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
                                </svg>
                                <span>Collapse All</span>
                            </button>
                        </div>
                    )}

                    {isAdmin && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center space-x-2 bg-kestrel-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Create Project</span>
                        </button>
                    )}

                    <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                        <span className="text-sm font-medium text-slate-500 ml-2">Filter:</span>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="text-sm font-medium text-slate-600 bg-slate-50 border-none rounded-md px-3 py-1.5 focus:ring-2 focus:ring-kestrel-blue outline-none cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="service">Service</option>
                            <option value="product">Product</option>
                        </select>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="text-sm font-medium text-slate-600 bg-slate-50 border-none rounded-md px-3 py-1.5 focus:ring-2 focus:ring-kestrel-blue outline-none cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                        <span className="text-sm font-medium text-slate-500 ml-2">Sort by:</span>
                        <div className="flex bg-slate-50 rounded-md p-1">
                            {(['title', 'client', 'type'] as SortKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                                        sortBy === key 
                                        ? 'bg-white text-kestrel-blue shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <span className="capitalize">{key}</span>
                                    {sortBy === key && (
                                        <ChevronUpDownIcon className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAndSortedProjects.length > 0 ? (
                        filteredAndSortedProjects.map((project) => (
                            collapsedProjectIds[project.id] ? (
                                <div 
                                    key={project.id} 
                                    onClick={() => setSelectedProject(project)}
                                    className="bg-white rounded-xl shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer p-4 group flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                project.status === 'Completed' ? 'bg-emerald-500 animate-pulse' :
                                                project.status === 'In Progress' ? 'bg-yellow-500 animate-pulse' :
                                                project.status === 'On Hold' ? 'bg-amber-500' :
                                                'bg-slate-400'
                                            }`} />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-bold text-slate-800 group-hover:text-kestrel-blue transition-colors truncate" title={project.title}>
                                                    {project.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 font-medium truncate">{project.client}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] border font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => toggleProjectExpand(project.id, e)}
                                                className="p-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                                title="Expand card details"
                                            >
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-400 uppercase tracking-wide">Progress:</span>
                                            <span className="font-bold text-kestrel-blue">{calculateProgress(project)}%</span>
                                        </div>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="truncate max-w-[150px] font-medium text-slate-400">
                                                {project.technologies.slice(0, 2).join(', ')}
                                                {project.technologies.length > 2 ? '...' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    key={project.id} 
                                    onClick={() => setSelectedProject(project)}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <ProjectPreview project={project} />
                                        <div className="p-6 pb-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-kestrel-blue transition-colors line-clamp-1 flex-1" title={project.title}>
                                                    {project.title}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] border flex-shrink-0 uppercase tracking-widest ${getStatusColor(project.status)}`}>
                                                        <span className={`w-1.25 h-1.25 rounded-full ${
                                                            project.status === 'Completed' ? 'bg-emerald-500 animate-pulse' :
                                                            project.status === 'In Progress' ? 'bg-yellow-500 animate-pulse' :
                                                            project.status === 'On Hold' ? 'bg-amber-500' :
                                                            'bg-slate-400'
                                                        }`} />
                                                        {project.status}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleProjectExpand(project.id, e)}
                                                        className="p-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                                        title="Collapse card details"
                                                    >
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-kestrel-teal font-medium mb-3">{project.client}</p>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {project.description}
                                            </p>
                                            
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Progress</span>
                                                    <span className="text-[10px] font-bold text-kestrel-blue">{calculateProgress(project)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-kestrel-blue transition-all duration-500" 
                                                        style={{ width: `${calculateProgress(project)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0">
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies?.slice(0, 3).map(tech => (
                                                <span key={tech} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.technologies && project.technologies.length > 3 && (
                                                <span className="text-slate-400 text-xs py-1 font-medium">+{project.technologies.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">No projects match the selected filters.</p>
                            <button 
                                onClick={() => { setFilterStatus('All'); setFilterType('All'); }}
                                className="mt-4 text-kestrel-blue font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <TimelineView />
            )}

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsCreateModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-2xl font-bold text-slate-800">Create New Project</h3>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Project Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newProject.title}
                                        onChange={e => setNewProject({...newProject, title: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. AI Customer Support"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Client Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newProject.client}
                                        onChange={e => setNewProject({...newProject, client: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Project Type</label>
                                    <div className="flex space-x-2">
                                        {['service', 'product'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewProject({...newProject, type: type as any})}
                                                className={`flex-1 py-2 rounded-lg font-bold transition-all border text-sm ${
                                                    newProject.type === type 
                                                    ? 'bg-kestrel-blue text-white border-kestrel-blue' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="capitalize">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Status</label>
                                    <select 
                                        value={newProject.status}
                                        onChange={e => setNewProject({...newProject, status: e.target.value as any})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Start Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={newProject.startDate}
                                        onChange={e => setNewProject({...newProject, startDate: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">End Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={newProject.endDate}
                                        onChange={e => setNewProject({...newProject, endDate: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={newProject.description}
                                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Describe the project goals and achievements..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Technologies (comma separated)</label>
                                <input 
                                    type="text" 
                                    value={newProject.technologies?.join(', ')}
                                    onChange={e => setNewProject({...newProject, technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '')})}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. React, Python, TensorFlow"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Key Features (comma separated)</label>
                                <input 
                                    type="text" 
                                    value={newProject.features?.join(', ')}
                                    onChange={e => setNewProject({...newProject, features: e.target.value.split(',').map(f => f.trim()).filter(f => f !== '')})}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Real-time analytics, Multi-language support"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Value Proposition</label>
                                <input 
                                    type="text" 
                                    value={newProject.valueProposition}
                                    onChange={e => setNewProject({...newProject, valueProposition: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Reduced support costs by 40%"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Deployed Website Link (Optional)</label>
                                    <input 
                                        type="url" 
                                        value={newProject.deployedUrl}
                                        onChange={e => setNewProject({...newProject, deployedUrl: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Demo Video URL (Optional)</label>
                                    <input 
                                        type="url" 
                                        value={newProject.demoVideoUrl}
                                        onChange={e => setNewProject({...newProject, demoVideoUrl: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            </div>

                            {/* Milestones Section in Create Modal */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700">Project Milestones</label>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newMilestone: Milestone = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                name: '',
                                                dueDate: new Date().toISOString().split('T')[0],
                                                status: 'Pending'
                                            };
                                            setNewProject({
                                                ...newProject,
                                                milestones: [...(newProject.milestones || []), newMilestone]
                                            });
                                        }}
                                        className="flex items-center space-x-1 text-xs font-bold text-kestrel-blue hover:text-blue-700 transition-colors"
                                    >
                                        <PlusIcon className="w-3 h-3" />
                                        <span>Add Milestone</span>
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {newProject.milestones?.map((milestone, idx) => (
                                        <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex-1 space-y-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Milestone name"
                                                    value={milestone.name}
                                                    onChange={e => {
                                                        const updated = [...(newProject.milestones || [])];
                                                        updated[idx] = { ...milestone, name: e.target.value };
                                                        setNewProject({ ...newProject, milestones: updated });
                                                    }}
                                                    className="w-full text-sm px-2 py-1 rounded border border-slate-200 outline-none focus:ring-1 focus:ring-kestrel-blue"
                                                />
                                                <input 
                                                    type="date"
                                                    value={milestone.dueDate}
                                                    onChange={e => {
                                                        const updated = [...(newProject.milestones || [])];
                                                        updated[idx] = { ...milestone, dueDate: e.target.value };
                                                        setNewProject({ ...newProject, milestones: updated });
                                                    }}
                                                    className="text-xs px-2 py-1 rounded border border-slate-200 outline-none focus:ring-1 focus:ring-kestrel-blue"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const updated = (newProject.milestones || []).filter(m => m.id !== milestone.id);
                                                    setNewProject({ ...newProject, milestones: updated });
                                                }}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!newProject.milestones || newProject.milestones.length === 0) && (
                                        <p className="text-xs text-slate-400 italic">No milestones added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Project Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                        {newProject.imageUrl ? (
                                            <img 
                                                src={newProject.imageUrl} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <PlusIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={(e) => handleImageUpload(e, false)}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                        >
                                            {isUploading ? 'Processing...' : 'Upload Image'}
                                        </button>
                                        <p className="text-xs text-slate-400 mt-1">Recommended: 1200x800px. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-kestrel-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && projectToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsDeleteModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Project?</h3>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-slate-700">"{projectToDelete.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors shadow-md"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
                    isModalMaximized ? 'p-0' : 'p-4 sm:p-6'
                }`}>
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className={`relative bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col z-10 ${
                        isModalMaximized 
                            ? 'w-full h-full max-h-screen rounded-none' 
                            : 'w-full max-w-4xl max-h-[90vh] rounded-2xl animate-in fade-in zoom-in duration-300'
                    }`}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editProject.title}
                                            onChange={e => setEditProject({...editProject, title: e.target.value})}
                                            className="text-2xl font-bold text-slate-800 border-b-2 border-kestrel-blue outline-none"
                                        />
                                    ) : (
                                        <h3 className="text-2xl font-bold text-slate-800">{selectedProject.title}</h3>
                                    )}
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(isEditing ? editProject.status as any : selectedProject.status)}`}>
                                        {isEditing ? editProject.status : selectedProject.status}
                                    </span>
                                </div>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={editProject.client}
                                        onChange={e => setEditProject({...editProject, client: e.target.value})}
                                        className="text-kestrel-teal font-medium border-b border-kestrel-teal outline-none"
                                    />
                                ) : (
                                    <p className="text-kestrel-teal font-medium">{selectedProject.client}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button 
                                    onClick={() => setIsModalMaximized(!isModalMaximized)}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-kestrel-blue inline-flex items-center justify-center cursor-pointer"
                                    title={isModalMaximized ? "Restore window (Minimize)" : "Expand to Fullscreen (Maximize)"}
                                    type="button"
                                >
                                    {isModalMaximized ? (
                                        <Minimize2 className="w-5 h-5 text-indigo-700" />
                                    ) : (
                                        <Maximize2 className="w-5 h-5" />
                                    )}
                                </button>
                                <button 
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-rose-600 inline-flex items-center justify-center cursor-pointer"
                                    title="Close dialog"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-6 space-y-8">
                            <div className={`grid grid-cols-1 ${selectedProject.demoVideoUrl ? 'md:grid-cols-2' : ''} gap-6`}>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        Project Image
                                    </h4>
                                    <div className="aspect-video rounded-xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
                                        <img 
                                            src={selectedProject.imageUrl} 
                                            alt={selectedProject.title}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                                {selectedProject.demoVideoUrl && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Video className="w-4 h-4 text-kestrel-teal" /> Interactive Demo Video
                                        </h4>
                                        <VideoPlayer url={selectedProject.demoVideoUrl} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h4>
                                        {isEditing ? (
                                            <textarea 
                                                rows={6}
                                                value={editProject.description}
                                                onChange={e => setEditProject({...editProject, description: e.target.value})}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all resize-none text-slate-600 leading-relaxed"
                                            />
                                        ) : (
                                            <p className="text-slate-600 leading-relaxed text-lg">
                                                {selectedProject.description}
                                            </p>
                                        )}
                                    </section>

                                    {(selectedProject.valueProposition || isEditing) && (
                                        <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                            <h4 className="text-sm font-bold text-kestrel-blue uppercase tracking-wider mb-3">Value Proposition</h4>
                                            {isEditing ? (
                                                <input 
                                                    type="text"
                                                    value={editProject.valueProposition}
                                                    onChange={e => setEditProject({...editProject, valueProposition: e.target.value})}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all bg-white"
                                                />
                                            ) : (
                                                <p className="text-slate-700 italic leading-relaxed">
                                                    "{selectedProject.valueProposition}"
                                                </p>
                                            )}
                                        </section>
                                    )}

                                    {(selectedProject.deployedUrl || selectedProject.demoVideoUrl || isEditing) && (
                                        <section className="flex flex-wrap gap-4">
                                            {(selectedProject.deployedUrl || isEditing) && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Deployed Website</h4>
                                                    {isEditing ? (
                                                        <input 
                                                            type="url"
                                                            value={editProject.deployedUrl}
                                                            onChange={e => setEditProject({...editProject, deployedUrl: e.target.value})}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                                            placeholder="https://example.com"
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={selectedProject.deployedUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 text-kestrel-blue hover:text-blue-700 transition-colors font-medium"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            <span>Visit Website</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {(selectedProject.demoVideoUrl || isEditing) && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Demo Video</h4>
                                                    {isEditing ? (
                                                        <input 
                                                            type="url"
                                                            value={editProject.demoVideoUrl}
                                                            onChange={e => setEditProject({...editProject, demoVideoUrl: e.target.value})}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                                            placeholder="https://youtube.com/..."
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={selectedProject.demoVideoUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 text-kestrel-teal hover:text-teal-700 transition-colors font-medium"
                                                        >
                                                            <Video className="w-4 h-4" />
                                                            <span>Watch Demo</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {(selectedProject.features?.length || isEditing) ? (
                                        <section>
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Key Features</h4>
                                            {isEditing ? (
                                                <input 
                                                    type="text"
                                                    value={editProject.features?.join(', ')}
                                                    onChange={e => setEditProject({...editProject, features: e.target.value.split(',').map(f => f.trim()).filter(f => f !== '')})}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-kestrel-blue focus:border-transparent outline-none transition-all"
                                                    placeholder="Comma separated features"
                                                />
                                            ) : (
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {selectedProject.features?.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start space-x-2 text-slate-600">
                                                            <span className="text-kestrel-blue mt-1">•</span>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </section>
                                    ) : null}

                                    {/* Milestones Section */}
                                    <section className="mt-8 pt-8 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Project Milestones</h4>
                                            {isEditing && (
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newMilestone: Milestone = {
                                                            id: Math.random().toString(36).substr(2, 9),
                                                            name: 'New Milestone',
                                                            dueDate: new Date().toISOString().split('T')[0],
                                                            status: 'Pending'
                                                        };
                                                        setEditProject({
                                                            ...editProject,
                                                            milestones: [...(editProject.milestones || []), newMilestone]
                                                        });
                                                    }}
                                                    className="flex items-center space-x-1 text-xs font-bold text-kestrel-blue hover:text-blue-700 transition-colors"
                                                >
                                                    <PlusIcon className="w-3 h-3" />
                                                    <span>Add Milestone</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {(isEditing ? editProject.milestones : selectedProject.milestones)?.length ? (
                                                (isEditing ? editProject.milestones : selectedProject.milestones)?.map((milestone, idx) => (
                                                    <div key={milestone.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                                        <div className="flex-1">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text"
                                                                    value={milestone.name}
                                                                    onChange={e => {
                                                                        const updatedMilestones = [...(editProject.milestones || [])];
                                                                        updatedMilestones[idx] = { ...milestone, name: e.target.value };
                                                                        setEditProject({ ...editProject, milestones: updatedMilestones });
                                                                    }}
                                                                    className="w-full text-sm font-semibold text-slate-700 border-b border-transparent focus:border-kestrel-blue outline-none bg-transparent"
                                                                />
                                                            ) : (
                                                                <p className="text-sm font-semibold text-slate-700">{milestone.name}</p>
                                                            )}
                                                            <div className="flex items-center space-x-3 mt-1">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="date"
                                                                        value={milestone.dueDate}
                                                                        onChange={e => {
                                                                            const updatedMilestones = [...(editProject.milestones || [])];
                                                                            updatedMilestones[idx] = { ...milestone, dueDate: e.target.value };
                                                                            setEditProject({ ...editProject, milestones: updatedMilestones });
                                                                        }}
                                                                        className="text-xs text-slate-400 border-b border-transparent focus:border-kestrel-blue outline-none bg-transparent"
                                                                    />
                                                                ) : (
                                                                    <p className="text-xs text-slate-400">Due: {format(parseISO(milestone.dueDate), 'MMM dd, yyyy')}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            {isEditing ? (
                                                                <select 
                                                                    value={milestone.status}
                                                                    onChange={e => {
                                                                        const updatedMilestones = [...(editProject.milestones || [])];
                                                                        updatedMilestones[idx] = { ...milestone, status: e.target.value as any };
                                                                        setEditProject({ ...editProject, milestones: updatedMilestones });
                                                                    }}
                                                                    className="text-xs font-bold px-2 py-1 rounded border border-slate-200 outline-none"
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="In Progress">In Progress</option>
                                                                    <option value="Completed">Completed</option>
                                                                    <option value="Delayed">Delayed</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                                                                    {milestone.status}
                                                                </span>
                                                            )}
                                                            {isEditing && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updatedMilestones = (editProject.milestones || []).filter(m => m.id !== milestone.id);
                                                                        setEditProject({ ...editProject, milestones: updatedMilestones });
                                                                    }}
                                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No milestones defined for this project.</p>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Project Info</h4>
                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
                                                    <span className="text-sm font-bold text-kestrel-blue">{calculateProgress(isEditing ? editProject : selectedProject)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-kestrel-blue transition-all duration-700 ease-out" 
                                                        style={{ width: `${calculateProgress(isEditing ? editProject : selectedProject)}%` }}
                                                    />
                                                </div>
                                                {(isEditing ? editProject.milestones : selectedProject.milestones)?.length ? (
                                                    <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                                                        {(isEditing ? editProject.milestones : selectedProject.milestones)?.filter(m => m.status === 'Completed').length} of {(isEditing ? editProject.milestones : selectedProject.milestones)?.length} milestones completed
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Type</p>
                                                {isEditing ? (
                                                    <select 
                                                        value={editProject.type}
                                                        onChange={e => setEditProject({...editProject, type: e.target.value as any})}
                                                        className="w-full px-2 py-1 rounded border border-slate-200 outline-none"
                                                    >
                                                        <option value="service">Service</option>
                                                        <option value="product">Product</option>
                                                    </select>
                                                ) : (
                                                    <p className="font-semibold text-slate-700 capitalize">{selectedProject.type}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Status</p>
                                                {isEditing ? (
                                                    <select 
                                                        value={editProject.status}
                                                        onChange={e => setEditProject({...editProject, status: e.target.value as any})}
                                                        className="w-full px-2 py-1 rounded border border-slate-200 outline-none"
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="On Hold">On Hold</option>
                                                    </select>
                                                ) : (
                                                    <div className="mt-1">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border flex-shrink-0 uppercase tracking-widest ${getStatusColor(selectedProject.status)}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                selectedProject.status === 'Completed' ? 'bg-emerald-500' :
                                                                selectedProject.status === 'In Progress' ? 'bg-yellow-500' :
                                                                selectedProject.status === 'On Hold' ? 'bg-amber-500' :
                                                                'bg-slate-400'
                                                            }`} />
                                                            {selectedProject.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Timeline</p>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input 
                                                            type="date"
                                                            value={editProject.startDate}
                                                            onChange={e => setEditProject({...editProject, startDate: e.target.value})}
                                                            className="w-full px-2 py-1 rounded border border-slate-200 outline-none text-sm"
                                                        />
                                                        <input 
                                                            type="date"
                                                            value={editProject.endDate}
                                                            onChange={e => setEditProject({...editProject, endDate: e.target.value})}
                                                            className="w-full px-2 py-1 rounded border border-slate-200 outline-none text-sm"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="font-semibold text-slate-700">
                                                        {selectedProject.startDate ? format(parseISO(selectedProject.startDate), 'MMM yyyy') : 'N/A'} - 
                                                        {selectedProject.endDate ? format(parseISO(selectedProject.endDate), 'MMM yyyy') : 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Client</p>
                                                <p className="font-semibold text-slate-700">{selectedProject.client || 'Internal Project'}</p>
                                            </div>
                                            {isEditing && (
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase mb-2">Project Image</p>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-16 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                                            <img 
                                                                src={editProject.imageUrl} 
                                                                alt="Preview" 
                                                                className="w-full h-full object-cover"
                                                                referrerPolicy="no-referrer"
                                                            />
                                                        </div>
                                                        <input 
                                                            type="file" 
                                                            ref={editFileInputRef}
                                                            onChange={(e) => handleImageUpload(e, true)}
                                                            accept="image/*"
                                                            className="hidden"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => editFileInputRef.current?.click()}
                                                            disabled={isUploading}
                                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {isUploading ? '...' : 'Change'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Technologies</h4>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={editProject.technologies?.join(', ')}
                                                onChange={e => setEditProject({...editProject, technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '')})}
                                                className="w-full px-2 py-1 rounded border border-slate-200 outline-none text-sm"
                                                placeholder="Comma separated"
                                            />
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.technologies?.map(tech => (
                                                    <span key={tech} className="bg-kestrel-blue/10 text-kestrel-blue text-xs px-3 py-1.5 rounded-lg font-bold">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 flex justify-end space-x-4">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleUpdateProject}
                                        className="px-6 py-2 bg-kestrel-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isAdmin && (
                                        <button 
                                            onClick={handleEditClick}
                                            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Edit Project
                                        </button>
                                    )}
                                    <button 
                                        onClick={closeModal}
                                        className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsView;
