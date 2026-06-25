import React, { useState } from 'react';
import { Client } from '../types';
import { BuildingOfficeIcon, MapPinIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface ClientsViewProps {
    clients: { business: Client[]; personal: Client[] };
    onUpdateClients?: (clients: { business: Client[]; personal: Client[] }) => void;
}

interface ClientFormState {
    id?: number;
    name: string;
    industry: string;
    country: string;
    type: 'business' | 'personal';
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients, onUpdateClients }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formState, setFormState] = useState<ClientFormState>({
        name: '',
        industry: '',
        country: '',
        type: 'business'
    });

    const openAddModal = (type: 'business' | 'personal') => {
        setFormState({
            name: '',
            industry: '',
            country: '',
            type
        });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (client: Client, type: 'business' | 'personal') => {
        setFormState({
            id: client.id,
            name: client.name,
            industry: client.industry,
            country: client.country,
            type
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteClient = (clientId: number, type: 'business' | 'personal') => {
        if (!onUpdateClients) return;
        if (confirm('Are you sure you want to delete this client registration?')) {
            const updatedGroup = clients[type].filter(c => c.id !== clientId);
            onUpdateClients({
                ...clients,
                [type]: updatedGroup
            });
        }
    };

    const handleSaveClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onUpdateClients) return;

        const allClients = [...clients.business, ...clients.personal];
        const nextId = allClients.length > 0 ? Math.max(...allClients.map(c => c.id)) + 1 : 1;

        const targetType = formState.type;
        const sourceId = formState.id;

        // Clean arrays
        let finalBusiness = [...clients.business];
        let finalPersonal = [...clients.personal];

        if (modalMode === 'add') {
            const newClient: Client = {
                id: nextId,
                name: formState.name,
                industry: formState.industry,
                country: formState.country
            };
            if (targetType === 'business') {
                finalBusiness.push(newClient);
            } else {
                finalPersonal.push(newClient);
            }
        } else {
            // Edit mode
            // Remove from both first to handle possible segment changes
            finalBusiness = finalBusiness.filter(c => c.id !== sourceId);
            finalPersonal = finalPersonal.filter(c => c.id !== sourceId);

            const editedClient: Client = {
                id: sourceId!,
                name: formState.name,
                industry: formState.industry,
                country: formState.country
            };

            if (targetType === 'business') {
                finalBusiness.push(editedClient);
            } else {
                finalPersonal.push(editedClient);
            }
        }

        onUpdateClients({
            business: finalBusiness,
            personal: finalPersonal
        });

        setIsModalOpen(false);
    };

    return (
        <div className="space-y-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-800">Our Valued Clients</h2>
                <p className="text-slate-500 mt-2">Building lasting partnerships across industries.</p>
                {isAdmin && (
                    <div className="mt-4 flex justify-center gap-3">
                        <button
                            onClick={() => openAddModal('business')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-kestrel-blue text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-600 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Business Client</span>
                        </button>
                        <button
                            onClick={() => openAddModal('personal')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-kestrel-teal text-white rounded-xl text-xs font-bold shadow-md hover:bg-teal-600 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Personal Client</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* Business Clients */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                    <h3 className="text-2xl font-bold text-kestrel-blue">Business Clients</h3>
                    {isAdmin && (
                        <button
                            onClick={() => openAddModal('business')}
                            className="text-xs font-bold text-kestrel-blue hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                        >
                            <Plus className="w-4.5 h-4.5" />
                            <span>Add Client</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {clients.business.map((client) => (
                        <div key={client.id} className="group relative bg-white rounded-xl shadow-lg p-6 flex items-start space-x-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-kestrel-blue/10 p-3 rounded-full flex-shrink-0">
                                <BuildingOfficeIcon className="w-8 h-8 text-kestrel-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xl font-bold text-slate-800 mb-1 truncate">{client.name}</h4>
                                <p className="text-sm text-kestrel-teal font-medium mb-3 truncate">{client.industry}</p>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <MapPinIcon className="w-4 h-4 mr-2 text-slate-400" />
                                    <span>{client.country}</span>
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <div className="absolute right-3 top-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-150 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(client, 'business')}
                                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-600 hover:text-kestrel-blue rounded-md transition-colors cursor-pointer"
                                        title="Edit Client"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client.id, 'business')}
                                        className="p-1 px-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                        title="Delete Client"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {clients.business.length === 0 && (
                        <div className="col-span-full border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-405">
                            No business client entries configured.
                        </div>
                    )}
                </div>
            </section>

            {/* Personal Clients */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                    <h3 className="text-2xl font-bold text-kestrel-blue">Personal Clients</h3>
                    {isAdmin && (
                        <button
                            onClick={() => openAddModal('personal')}
                            className="text-xs font-bold text-kestrel-teal hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                        >
                            <Plus className="w-4.5 h-4.5" />
                            <span>Add Client</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {clients.personal.map((client) => (
                        <div key={client.id} className="group relative bg-white rounded-xl shadow-lg p-6 flex items-start space-x-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="bg-kestrel-teal/10 p-3 rounded-full flex-shrink-0">
                                <BuildingOfficeIcon className="w-8 h-8 text-kestrel-teal" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xl font-bold text-slate-800 mb-1 truncate">{client.name}</h4>
                                <p className="text-sm text-kestrel-teal font-medium mb-3 truncate">{client.industry}</p>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <MapPinIcon className="w-4 h-4 mr-2 text-slate-400" />
                                    <span>{client.country}</span>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="absolute right-3 top-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-150 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(client, 'personal')}
                                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-600 hover:text-kestrel-blue rounded-md transition-colors cursor-pointer"
                                        title="Edit Client"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client.id, 'personal')}
                                        className="p-1 px-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                        title="Delete Client"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {clients.personal.length === 0 && (
                        <div className="col-span-full border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-405">
                            No personal client entries configured.
                        </div>
                    )}
                </div>
            </section>

            {/* CMS Add / Edit Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
                        <div className="bg-kestrel-blue text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                {modalMode === 'add' ? 'Add Valued Client' : 'Edit Client Details'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="text-white/85 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Client / Brand Name</label>
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                    placeholder="Enter client or entity name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Industry Segment</label>
                                <input
                                    type="text"
                                    value={formState.industry}
                                    onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                    placeholder="e.g. Healthcare, Supply Chain, Retail"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Geographic Country</label>
                                <input
                                    type="text"
                                    value={formState.country}
                                    onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                    required
                                    placeholder="e.g. India, USA, Germany"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Grouping Section</label>
                                <select
                                    value={formState.type}
                                    onChange={(e) => setFormState({ ...formState, type: e.target.value as any })}
                                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:border-kestrel-blue focus:ring-kestrel-blue"
                                >
                                    <option value="business">Business Clients</option>
                                    <option value="personal">Personal Clients</option>
                                </select>
                            </div>

                            <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-kestrel-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{modalMode === 'add' ? 'Add Client' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsView;

