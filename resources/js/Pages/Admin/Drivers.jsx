import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Drivers({ authUser, drivers, stats, recentAssignments }) {
    const [localDrivers, setLocalDrivers] = useState(drivers);
    const [localStats, setLocalStats] = useState(stats);
    const [localAssignments, setLocalAssignments] = useState(recentAssignments);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['drivers', 'stats', 'recentAssignments'] });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setLocalDrivers(drivers);
        setLocalStats(stats);
        setLocalAssignments(recentAssignments);
    }, [drivers, stats, recentAssignments]);

    // Driver management functions disabled
    const handleAddDriver = () => {
        alert('Driver creation is disabled. Please use the Users page to add drivers.');
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'available': return 'bg-emerald-100 text-emerald-700';
            case 'on_duty': return 'bg-amber-100 text-amber-700';
            case 'off_duty': return 'bg-gray-100 text-gray-700';
            case 'on_leave': return 'bg-blue-100 text-blue-700';
            case 'in_transit': return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'busy': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <AdminLayout title="Driver Management" authUser={authUser} activeMenu="drivers" pendingDeliveries={stats?.pending_deliveries || 0}>
            <div className="space-y-6">

                {/* Toolbar - Compact */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search drivers..."
                                className="w-64 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                        </button>
                    </div>
                   
                </div>

                {/* Drivers Table - Compact */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    {['Driver', 'License', 'Status', 'Contact', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {localDrivers.map((driver) => (
                                    <tr key={driver.driver_id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-semibold text-xs">{driver.user?.firstname?.charAt(0) || 'D'}</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{driver.user?.firstname} {driver.user?.lastname}</div>
                                                    <div className="text-xs text-slate-500">ID: {String(driver.driver_id).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                            {driver.license_no}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${getStatusColor(driver.availability_status)}`}>
                                                {driver.availability_status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                            {driver.user?.contact_number || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1.5 text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-md transition-all" title="Send Message">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity - Compact */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full"></span>
                        Recent Assignments
                    </h3>
                    <div className="space-y-2">
                        {localAssignments.length > 0 ? (
                            localAssignments.map((assignment) => (
                                <div key={assignment.delivery_id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{assignment.driver?.user?.firstname} {assignment.driver?.user?.lastname}</p>
                                        <p className="text-[10px] text-slate-500">DEL-{String(assignment.delivery_id).padStart(6, '0')}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(assignment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-3">No recent assignments</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
