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
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Premium Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-md shadow-indigo-200">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">Driver List</h1>
                            <p className="text-xs text-slate-500">View all available drivers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live
                    </div>
                </div>

                {/* Drivers Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-700">All Drivers</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-50">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    {['Name', 'License', 'Status', 'Active', 'Actions'].map((header) => (
                                        <th key={header} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {drivers && drivers.length > 0 ? (
                                    drivers.map((driver) => (
                                        <tr key={driver.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-semibold text-xs">{driver.name?.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-900">{driver.name}</div>
                                                        <div className="text-[10px] text-slate-500">@{driver.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-600">{driver.license}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-md border ${
                                                    driver.status === 'available'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : driver.status === 'in_transit'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : driver.status === 'busy'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    {driver.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-600">{driver.active_deliveries || 0}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <button className="p-1.5 text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="View">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-8 text-center">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">No drivers found</p>
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
