import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { ArrowLeft, MapPin, Calendar, Clock, Wrench, FileImage, X, FileText } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import usePagination from '@/hooks/usePagination';

export default function RescueHistory({ authUser, rescueHistory }) {
    const [selectedRescue, setSelectedRescue] = useState(null);
    const { paginatedData, currentPage, setCurrentPage, totalPages } = usePagination(rescueHistory, 10);

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
            
            <div className="max-w-7xl pb-12">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => router.get('/office-staff/rescue-dispatch')}
                        className="p-2 border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Recent Rescues</h1>
                        <p className="text-zinc-500 font-medium mt-2">History of all resolved emergency dispatches</p>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Driver</th>
                                    <th className="px-6 py-4">Truck</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Mechanic</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {rescueHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-400 font-semibold uppercase tracking-widest text-xs">
                                            No rescue history found.
                                        </td>
                                    </tr>
                                ) : paginatedData.map(rescue => (
                                    <tr key={rescue.rescue_id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-zinc-900">
                                                    {formatDate(rescue.created_at).split(',')[0]}
                                                </span>
                                                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">
                                                    {formatDate(rescue.created_at).split(',')[1]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-zinc-900">
                                                {rescue.driver?.user ? `${rescue.driver.user.firstname || ''} ${rescue.driver.user.lastname || ''}`.trim() || 'Unknown' : 'Unknown Driver'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-zinc-700">
                                                {rescue.truck?.plate_number || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                                                <Wrench className="w-3 h-3" />
                                                {rescue.issue_category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-zinc-700">
                                                {rescue.mechanic ? `${rescue.mechanic.firstname || ''} ${rescue.mechanic.lastname || ''}`.trim() || 'Unknown' : 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedRescue(rescue)}
                                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {rescueHistory.length > 0 && (
                        <div className="bg-white border-t border-zinc-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={rescueHistory.length}
                                itemsPerPage={10}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Rescue Detail Modal */}
            {selectedRescue && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={() => setSelectedRescue(null)} />
                        
                        <div className="relative w-full max-w-2xl bg-white border border-zinc-200 shadow-xl flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Rescue Details</h3>
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">{formatDate(selectedRescue.created_at)}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedRescue(null)}
                                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="w-5 h-5" strokeWidth={2} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-zinc-50 border border-zinc-200">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Driver</div>
                                        <div className="font-bold text-zinc-900">{selectedRescue.driver?.user ? `${selectedRescue.driver.user.firstname || ''} ${selectedRescue.driver.user.lastname || ''}`.trim() : 'Unknown'}</div>
                                        <div className="text-xs font-semibold text-zinc-500 mt-1">{selectedRescue.driver?.user?.contact_number || 'No phone'}</div>
                                    </div>
                                    <div className="p-4 bg-zinc-50 border border-zinc-200">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Truck</div>
                                        <div className="font-bold text-zinc-900">{selectedRescue.truck?.plate_number || 'N/A'}</div>
                                        <div className="text-xs font-semibold text-zinc-500 mt-1">{selectedRescue.truck?.model || ''}</div>
                                    </div>
                                    <div className="p-4 bg-zinc-50 border border-zinc-200">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Mechanic</div>
                                        <div className="font-bold text-zinc-900">{selectedRescue.mechanic ? `${selectedRescue.mechanic.firstname || ''} ${selectedRescue.mechanic.lastname || ''}`.trim() : 'Unknown'}</div>
                                        <div className="text-xs font-semibold text-zinc-500 mt-1">Resolved: {formatDate(selectedRescue.resolved_at)}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Wrench className="w-3.5 h-3.5" /> Issue Info
                                    </h4>
                                    <div className="bg-white border border-zinc-200 p-4">
                                        <div className="inline-block px-2 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-widest border border-amber-200 mb-3">
                                            {selectedRescue.issue_category}
                                        </div>
                                        <p className="text-sm font-medium text-zinc-700 whitespace-pre-wrap">
                                            {selectedRescue.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> Location
                                    </h4>
                                    <div className="bg-white border border-zinc-200 p-4 text-sm font-medium text-zinc-700">
                                        {selectedRescue.address || `${selectedRescue.latitude}, ${selectedRescue.longitude}`}
                                    </div>
                                </div>

                                {selectedRescue.parts && selectedRescue.parts.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Parts Used</h4>
                                        <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
                                            {selectedRescue.parts.map((part, index) => (
                                                <div key={index} className="p-4 flex justify-between items-center text-sm">
                                                    <span className="font-bold text-zinc-900">{part.part_name}</span>
                                                    <span className="text-zinc-600 font-semibold bg-zinc-100 px-2 py-1 border border-zinc-200 text-[10px] uppercase tracking-widest">Qty: {part.pivot?.quantity || 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedRescue.media && selectedRescue.media.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FileImage className="w-3.5 h-3.5" /> Attached Media
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {selectedRescue.media.map(m => (
                                                <a key={m.id} href={`/storage/${m.file_path}`} target="_blank" rel="noreferrer" className="block relative aspect-square border border-zinc-200 hover:border-zinc-400 transition-colors bg-zinc-50">
                                                    {m.file_type === 'video' ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                                            <FileImage className="w-8 h-8 mb-2" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Video</span>
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
                </div>
            )}
        </OfficeStaffLayout>
    );
}
