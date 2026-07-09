import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';

export default function Drivers({ drivers, authUser }) {
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Auto-refresh every 5 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['drivers'], 
                preserveScroll: true, 
                preserveState: true,
                onSuccess: () => setLastUpdated(new Date())
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <OperationalManagerLayout title="Driver List" authUser={authUser} activeMenu="drivers">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Premium Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Drivers Registry</h1>
                            <p className="text-xs text-slate-500 font-medium font-sans">Active operational operators roster and duty dispatch status tracking</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Live Syncing</span>
                    </div>
                </div>

                {/* Drivers Table */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operational Drivers List</span>
                        <span className="text-[10px] font-semibold text-slate-400">Total Operators: {drivers?.length || 0}</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    {['Driver Name', 'License Number', 'Active Duty Status', 'Active Shipments', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {drivers && drivers.length > 0 ? (
                                    drivers.map((driver) => (
                                        <tr key={driver.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {driver.profile_image ? (
                                                        <img src={driver.profile_image.startsWith('http') || driver.profile_image.startsWith('/') ? driver.profile_image : `/storage/${driver.profile_image}`} alt="Profile" className="w-8 h-8 rounded-lg object-cover shadow-sm border border-slate-200" />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm border border-slate-800">
                                                            <span>{driver.name?.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">{driver.name}</div>
                                                        <div className="text-[10px] text-slate-400">@{driver.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-600">
                                                {driver.license || '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                                                    driver.status === 'available'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                                        : driver.status === 'in_transit'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                                            : driver.status === 'busy'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200/50'
                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    {driver.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                                                {driver.active_deliveries || 0}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button 
                                                    className="p-1.5 text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">No drivers registered currently</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </OperationalManagerLayout>
    );
}
