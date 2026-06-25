import React, { useState, useRef } from 'react';
import { StaffMember } from '../types';
import { EditIcon, SaveIcon, XMarkIcon, TrashIcon, PlusIcon } from './Icons';
import { fileToDataUrl, resizeImage } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';

interface TeamSectionProps {
    staff: StaffMember[];
    onUpdateStaff: (updatedStaff: StaffMember[]) => void;
}

const TeamSection: React.FC<TeamSectionProps> = ({ staff, onUpdateStaff }) => {
    const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
    const [editedStaffInfo, setEditedStaffInfo] = useState({ name: '', title: '' });
    const staffFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const handleEditClick = (member: StaffMember) => {
        if (!isAdmin) return;
        setEditingStaffId(member.id);
        setEditedStaffInfo({ name: member.name, title: member.title });
    };

    const handleCancelClick = () => {
        setEditingStaffId(null);
    };

    const handleSaveClick = (memberId: number) => {
        if (!isAdmin) return;
        const updatedStaff = staff.map(member =>
            member.id === memberId
                ? { ...member, name: editedStaffInfo.name, title: editedStaffInfo.title }
                : member
        );
        onUpdateStaff(updatedStaff);
        setEditingStaffId(null);
    };

    const handleStaffInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return;
        const { name, value } = e.target;
        setEditedStaffInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleStaffImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) {
            alert("Only an Administrator can change team member images.");
            return;
        }
        if (!selectedStaffId) return;

        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            try {
                const base64String = await fileToDataUrl(file);
                const resizedImage = await resizeImage(base64String, 300, 300, 0.7);

                const updatedStaff = staff.map(member =>
                    member.id === selectedStaffId
                        ? { ...member, imageUrl: resizedImage }
                        : member
                );
                onUpdateStaff(updatedStaff);
            } catch (error) {
                if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    alert('Storage limit reached. Could not save new image.');
                } else {
                    console.error("Failed to process image:", error);
                    alert("There was an error processing your image. Please try again.");
                }
            }
        }
        setSelectedStaffId(null);
        if (event.target) event.target.value = '';
    };

    const triggerStaffImageUpload = (staffId: number) => {
        if (!isAdmin) return;
        setSelectedStaffId(staffId);
        staffFileInputRef.current?.click();
    };

    return (
        <div className="mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-12 text-center">Meet Our Team</h3>
            <input
                type="file"
                ref={staffFileInputRef}
                onChange={handleStaffImageUpload}
                className="hidden"
                accept="image/*"
                aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {staff.map((member) => (
                    <div key={member.id} className="group text-center bg-slate-50 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
                        {editingStaffId === member.id && isAdmin ? (
                            <>
                                <div
                                    className="relative w-32 h-32 mx-auto mb-4 group/image cursor-pointer"
                                    onClick={() => triggerStaffImageUpload(member.id)}
                                    title="Click to change image"
                                >
                                    <img
                                        src={member.imageUrl || member.defaultImageUrl}
                                        alt={member.name}
                                        className="rounded-full w-full h-full object-cover ring-4 ring-kestrel-blue/20"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity">
                                        <EditIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <input
                                        type="text"
                                        name="name"
                                        value={editedStaffInfo.name}
                                        onChange={handleStaffInfoChange}
                                        className="w-full text-center text-xl font-bold text-slate-800 bg-white border border-kestrel-blue rounded-md px-2 py-1"
                                        placeholder="Name"
                                     />
                                     <input
                                        type="text"
                                        name="title"
                                        value={editedStaffInfo.title}
                                        onChange={handleStaffInfoChange}
                                        className="w-full text-center text-kestrel-nav-text bg-white border border-kestrel-blue rounded-md px-2 py-1"
                                        placeholder="Title"
                                     />
                                </div>
                                <div className="flex justify-center items-center space-x-3 mt-4">
                                   <button
                                        onClick={() => handleSaveClick(member.id)}
                                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                                        aria-label="Save changes"
                                   >
                                       <SaveIcon className="w-5 h-5"/>
                                   </button>
                                   <button
                                        onClick={handleCancelClick}
                                        className="p-2 bg-red-100 text-red-650 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                        aria-label="Cancel editing"
                                   >
                                       <XMarkIcon className="w-5 h-5"/>
                                   </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-32 h-32 mx-auto mb-4">
                                    <img
                                        src={member.imageUrl || member.defaultImageUrl}
                                        alt={member.name}
                                        className="rounded-full w-full h-full object-cover ring-4 ring-kestrel-blue/20"
                                    />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 min-h-[28px]">{member.name}</h4>
                                <p className="text-kestrel-nav-text mb-4 min-h-[24px]">{member.title}</p>
                                 {isAdmin && (
                                     <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button
                                            onClick={() => handleEditClick(member)}
                                            className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors cursor-pointer"
                                            aria-label="Edit team member details"
                                            title="Click to edit name and title"
                                         >
                                            <EditIcon className="w-4 h-4"/>
                                         </button>
                                         <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
                                                    const updated = staff.filter(m => m.id !== member.id);
                                                    onUpdateStaff(updated);
                                                }
                                            }}
                                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                            aria-label="Delete team member"
                                            title="Delete member"
                                         >
                                            <TrashIcon className="w-4 h-4" />
                                         </button>
                                     </div>
                                 )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            
            {isAdmin && (
                <div className="mt-10 flex justify-center">
                    <button
                        onClick={() => {
                            const newMember: StaffMember = {
                                id: Date.now(),
                                name: 'New Custom Staff',
                                title: 'Consultant',
                                defaultImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
                                imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'
                            };
                            onUpdateStaff([...staff, newMember]);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-kestrel-blue px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Team Member</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeamSection;
