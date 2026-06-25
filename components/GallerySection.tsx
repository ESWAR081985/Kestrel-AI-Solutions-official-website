import React, { useState, useRef } from 'react';
import { GalleryImage } from '../types';
import { EditIcon, SaveIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { fileToDataUrl, resizeImage } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';

interface GallerySectionProps {
    images: GalleryImage[];
    onUpdateImages: (updatedImages: GalleryImage[]) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ images, onUpdateImages }) => {
    const [galleryIndex, setGalleryIndex] = useState(0);
    const galleryFileInputRef = useRef<HTMLInputElement>(null);
    const [isGalleryEditing, setIsGalleryEditing] = useState(false);
    const [replacingImageId, setReplacingImageId] = useState<number | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const handleGalleryFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            if (replacingImageId) setReplacingImageId(null);
            return;
        }

        try {
            if (replacingImageId) {
                const file = files[0];
                const base64String = await fileToDataUrl(file);
                const resizedImage = await resizeImage(base64String, 800, 600, 0.7);

                const updatedGallery = images.map(img =>
                    img.id === replacingImageId ? { ...img, src: resizedImage, alt: file.name } : img
                );
                onUpdateImages(updatedGallery);
            } else {
                const newImagesPromises = Array.from(files)
                    .filter(file => file.type.startsWith('image/'))
                    .map(async (file): Promise<GalleryImage> => {
                        const base64String = await fileToDataUrl(file);
                        const resizedImage = await resizeImage(base64String, 800, 600, 0.7);
                        return { id: Date.now() + Math.random(), src: resizedImage, alt: file.name };
                    });

                const newImages = await Promise.all(newImagesPromises);
                const updatedGallery = [...images, ...newImages];
                onUpdateImages(updatedGallery);
                if (!isGalleryEditing) setGalleryIndex(images.length);
            }
        } catch (error) {
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                alert('Storage limit exceeded! Could not save new images.');
            } else {
                console.error("Failed to process images for gallery:", error);
                alert("There was an error processing your images. Please try again.");
            }
        } finally {
            if (replacingImageId) setReplacingImageId(null);
            if (event.target) event.target.value = '';
        }
    };

    const triggerAddNewGalleryImages = () => {
        setReplacingImageId(null);
        galleryFileInputRef.current?.click();
    };

    const triggerReplaceGalleryImage = (id: number) => {
        setReplacingImageId(id);
        galleryFileInputRef.current?.click();
    };

    const handleDeleteGalleryImage = (idToDelete: number) => {
        const updatedGallery = images.filter(image => image.id !== idToDelete);
        onUpdateImages(updatedGallery);
        if (galleryIndex >= updatedGallery.length && updatedGallery.length > 0) {
            setGalleryIndex(updatedGallery.length - 1);
        } else if (updatedGallery.length === 0) {
            setGalleryIndex(0);
        }
    };
    
    const handlePrevImage = () => {
        setGalleryIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };
    
    const handleNextImage = () => {
        setGalleryIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="mt-20">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-slate-800">Our Culture & Workplace</h3>
                 {isAdmin && (
                     <div className="flex items-center gap-4">
                         <button
                            onClick={triggerAddNewGalleryImages}
                            className="flex items-center gap-2 rounded-md bg-kestrel-teal px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kestrel-teal"
                            aria-label="Add new images to gallery"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            Add Images
                        </button>
                        {isGalleryEditing && isAdmin ? (
                            <button
                                onClick={() => setIsGalleryEditing(false)}
                                className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
                                aria-label="Save changes and exit edit mode"
                            >
                                <SaveIcon className="w-5 h-5" />
                                Save Changes
                            </button>
                        ) : (
                             <button
                                onClick={() => setIsGalleryEditing(true)}
                                className="flex items-center gap-2 rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 transition-colors"
                                aria-label="Edit gallery"
                             >
                                <EditIcon className="w-5 h-5"/>
                                Edit Gallery
                             </button>
                        )}
                    </div>
                 )}
            </div>
            <input
                type="file"
                ref={galleryFileInputRef}
                onChange={handleGalleryFileInputChange}
                className="hidden"
                accept="image/*"
                multiple
                aria-hidden="true"
            />

            {isGalleryEditing && isAdmin ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map(image => (
                        <div key={image.id} className="group/edit relative aspect-square bg-slate-800 rounded-lg overflow-hidden shadow-md">
                            <img src={image.src} alt={image.alt} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/edit:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    onClick={() => triggerReplaceGalleryImage(image.id)}
                                    className="p-3 bg-slate-100 text-slate-700 rounded-full hover:bg-white hover:scale-110 transition-all"
                                    aria-label="Replace image"
                                    title="Replace"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteGalleryImage(image.id)}
                                    className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all"
                                    aria-label="Delete image"
                                    title="Delete"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                     <button
                        onClick={triggerAddNewGalleryImages}
                        className="aspect-square flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 hover:border-kestrel-blue hover:text-kestrel-blue transition-colors"
                    >
                        <PlusIcon className="w-8 h-8" />
                        <span className="font-semibold">Add More</span>
                    </button>
                </div>
            ) : (
                images.length > 0 ? (
                    <div className="relative group/gallery">
                        <div className="overflow-hidden rounded-xl shadow-lg bg-slate-800" style={{ height: '32rem' }}>
                            <div
                                className="flex transition-transform duration-500 ease-in-out h-full"
                                style={{ transform: `translateX(-${galleryIndex * 100}%)` }}
                            >
                                {images.map((image) => (
                                    <div key={image.id} className="w-full flex-shrink-0 h-full flex items-center justify-center">
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute top-1/2 -translate-y-1/2 left-4 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all opacity-0 group-hover/gallery:opacity-100 focus:opacity-100"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={handleNextImage}
                                    className="absolute top-1/2 -translate-y-1/2 right-4 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all opacity-0 group-hover/gallery:opacity-100 focus:opacity-100"
                                    aria-label="Next image"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                                
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setGalleryIndex(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-colors ${galleryIndex === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-white rounded-xl border-2 border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium">No company images uploaded yet.</p>
                        <p className="text-slate-400 text-sm mt-2">Click "Add Images" or "Edit Gallery" to build your visual story.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default GallerySection;
