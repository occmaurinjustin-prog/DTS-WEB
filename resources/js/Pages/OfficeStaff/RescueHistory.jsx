import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { ArrowLeft, MapPin, Calendar, Clock, Wrench, FileImage, XCircle, FileText } from 'lucide-react';

export default function RescueHistory({ authUser, rescueHistory }) {
    const [selectedRescue, setSelectedRescue] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <OfficeStaffLayout title="Rescue History" authUser={authUser} activeMenu="rescue">
            <Head title="Rescue History" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.get('/office-staff/rescue-dispatch')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Recent Rescues</h1>
                        <p className="text-sm text-slate-500">History of all resolved emergency dispatches</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                                    <th className="p-4 py-3">Date</th>
                                    <th className="p-4 py-3">Driver</th>
                                    <th className="p-4 py-3">Truck</th>
                                    <th className="p-4 py-3">Category</th>
                                    <th className="p-4 py-3">Mechanic</th>
                                    <th className="p-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rescueHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                            No rescue history found.
                                        </td>
                                    </tr>
                                ) : rescueHistory.map(rescue => (
                                    <tr key={rescue.rescue_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">
                                                    {formatDate(rescue.created_at).split(',')[0]}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {formatDate(rescue.created_at).split(',')[1]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-semibold text-slate-900">
                                                {rescue.driver?.user ? `${rescue.driver.user.firstname || ''} ${rescue.driver.user.lastname || ''}`.trim() || 'Unknown' : 'Unknown Driver'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-700">
                                                {rescue.truck?.plate_number || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                <Wrench className="w-3 h-3" />
                                                {rescue.issue_category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-700">
                                                {rescue.mechanic ? `${rescue.mechanic.firstname || ''} ${rescue.mechanic.lastname || ''}`.trim() || 'Unknown' : 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedRescue(rescue)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Rescue Detail Modal */}
            {selectedRescue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Rescue Details</h3>
                                <p className="text-sm text-slate-500">{formatDate(selectedRescue.created_at)}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedRescue(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Driver</div>
                                    <div className="font-medium text-slate-900">{selectedRescue.driver?.user ? `${selectedRescue.driver.user.firstname || ''} ${selectedRescue.driver.user.lastname || ''}`.trim() : 'Unknown'}</div>
                                    <div className="text-sm text-slate-500">{selectedRescue.driver?.user?.contact_number || 'No phone'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Truck</div>
                                    <div className="font-medium text-slate-900">{selectedRescue.truck?.plate_number || 'N/A'}</div>
                                    <div className="text-sm text-slate-500">{selectedRescue.truck?.model || ''}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mechanic</div>
                                    <div className="font-medium text-slate-900">{selectedRescue.mechanic ? `${selectedRescue.mechanic.firstname || ''} ${selectedRescue.mechanic.lastname || ''}`.trim() : 'Unknown'}</div>
                                    <div className="text-sm text-slate-500">Resolved at: {formatDate(selectedRescue.resolved_at)}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-slate-400" /> Issue Info
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl p-4">
                                    <div className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 font-medium text-xs rounded-md border border-amber-200 mb-3">
                                        {selectedRescue.issue_category}
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                        {selectedRescue.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" /> Location
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                                    {selectedRescue.address || `${selectedRescue.latitude}, ${selectedRescue.longitude}`}
                                </div>
                            </div>

                            {selectedRescue.parts && selectedRescue.parts.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Parts Used</h4>
                                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                                        {selectedRescue.parts.map((part, index) => (
                                            <div key={index} className="p-3 flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-700">{part.part_name}</span>
                                                <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Qty: {part.pivot?.quantity || 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedRescue.media && selectedRescue.media.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                        <FileImage className="w-4 h-4 text-slate-400" /> Attached Media
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {selectedRescue.media.map(m => (
                                            <a key={m.id} href={`/storage/${m.file_path}`} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors">
                                                {m.file_type === 'video' ? (
                                                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                                                        <FileImage className="w-8 h-8 mb-2" />
                                                        <span className="text-xs font-medium">Video</span>
                                                    </div>
                                                ) : (
                                                    <img src={`/storage/${m.file_path}`} alt="Rescue attachment" className="w-full h-full object-cover" />
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </OfficeStaffLayout>
    );
}
