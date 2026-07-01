import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';

export default function Dashboard({ authUser, stats, recentDeliveries }) {
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Auto-refresh every 5 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['stats', 'recentDeliveries'], 
                preserveScroll: true, 
                preserveState: true,
                onSuccess: () => setLastUpdated(new Date())
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <OperationalManagerLayout title="Dashboard" authUser={authUser} activeMenu="dashboard">
            <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* Premium Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Operations Control</h1>
                            <p className="text-xs text-slate-500 font-medium">Real-time status overview of active fleet dispatch and clients requests</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Link
                            href="/operational-manager/recent-deliveries"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Recent Requests</span>
                        </Link>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1.5 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Live Syncing</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Shipments', value: stats?.total_deliveries || 0, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-slate-50 border-slate-200/60', iconColor: 'text-slate-600', badgeColor: 'bg-slate-100 text-slate-700' },
                        { label: 'Completed', value: stats?.completed_deliveries || 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-50/40 border-emerald-100', iconColor: 'text-emerald-500', badgeColor: 'bg-emerald-50 text-emerald-700' },
                        { label: 'In Progress', value: stats?.in_progress_deliveries || 0, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-blue-50/40 border-blue-100', iconColor: 'text-blue-500', badgeColor: 'bg-blue-50 text-blue-700' },
                        { label: 'Pending Dispatch', value: stats?.pending_deliveries || 0, icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-amber-50/40 border-amber-100', iconColor: 'text-amber-500', badgeColor: 'bg-amber-50 text-amber-700' }
                    ].map((stat) => (
                        <div key={stat.label} className={`bg-white rounded-xl p-4 border ${stat.bg} shadow-sm hover:shadow-md transition-shadow`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.badgeColor}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link 
                        href="/operational-manager/deliveries"
                        className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-[#10B981] transition-colors">New Delivery</p>
                                <p className="text-[10px] text-slate-400 font-medium">Create a shipping request</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        href="/operational-manager/clients"
                        className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-[#10B981] transition-colors">Client Directory</p>
                                <p className="text-[10px] text-slate-400 font-medium">Manage operational clients</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        href="/operational-manager/drivers"
                        className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-[#10B981] transition-colors">Driver Roster</p>
                                <p className="text-[10px] text-slate-400 font-medium">Verify driver duty statuses</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Deliveries List */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Shipments</span>
                        </div>
                        <Link 
                            href="/operational-manager/recent-deliveries"
                            className="text-xs font-bold text-[#10B981] hover:text-[#059669] uppercase tracking-wider transition-colors"
                        >
                            View All →
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b border-slate-100">
                                    {['Waybill ID', 'Customer Name', 'Duty Status', 'Date Created', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentDeliveries && recentDeliveries.length > 0 ? (
                                    recentDeliveries.slice(0, 5).map((delivery) => (
                                        <tr key={delivery.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">#{delivery.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-600">{delivery.customer}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                                                    delivery.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                                                    delivery.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                                                    'bg-amber-50 text-amber-700 border-amber-200/50'
                                                }`}>
                                                    {delivery.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-400">{delivery.date}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link 
                                                    href={`/operational-manager/deliveries`}
                                                    className="text-xs font-bold text-[#10B981] hover:text-[#059669] uppercase tracking-wider transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">No recent deliveries found</p>
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
