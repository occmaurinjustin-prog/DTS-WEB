import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';

export default function Clients({ clients, authUser }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        client_name: '',
        phone: '',
        address: '',
    });
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Auto-refresh every 5 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['clients'], 
                preserveScroll: true, 
                preserveState: true,
                onSuccess: () => setLastUpdated(new Date())
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/operational-manager/clients', formData, {
            onSuccess: () => {
                setShowAddModal(false);
                setFormData({ client_name: '', phone: '', address: '' });
            },
        });
    };

    const handleDelete = (client) => {
        if (confirm(`Are you sure you want to delete client "${client.client_name}"?`)) {
            router.delete(`/operational-manager/clients/${client.client_id}`);
        }
    };

    return (
        <OperationalManagerLayout title="Client Management" authUser={authUser} activeMenu="clients">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Premium Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-md shadow-indigo-200">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">Client Management</h1>
                            <p className="text-xs text-slate-500">Manage your client database</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Client
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                        </div>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-700">All Clients</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-50">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    {['Client Name', 'Contact', 'Address', 'Actions'].map((header) => (
                                        <th key={header} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {clients && clients.length > 0 ? (
                                    clients.map((client) => (
                                        <tr key={client.client_id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-[#4F46E5] flex items-center justify-center text-[10px] font-semibold text-white">
                                                        {client.client_name?.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-800">{client.client_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-600">{client.phone}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-600 max-w-xs truncate">{client.address}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1.5 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors" title="View">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(client)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                        title="Delete"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-8 text-center">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">No clients found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-4 py-3 bg-[#4F46E5] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-white">Add New Client</h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Client Name</label>
                                <input
                                    type="text"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                    placeholder="e.g. ABC Company"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                    placeholder="e.g. +63 912 345 6789"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none resize-none"
                                    placeholder="e.g. 123 Main St, Manila"
                                    rows="2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4338CA] hover:shadow-lg transition-all"
                                >
                                    Add Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OperationalManagerLayout>
    );
}
