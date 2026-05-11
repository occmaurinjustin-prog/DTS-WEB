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
            <div className="space-y-4">
                {/* Premium Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-md shadow-indigo-200">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">Operations Dashboard</h1>
                            <p className="text-xs text-slate-500">Overview of delivery operations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/operational-manager/recent-deliveries"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Requests
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Total', value: stats?.total_deliveries || 0, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-slate-100', iconColor: 'text-slate-600' },
                        { label: 'Completed', value: stats?.completed_deliveries || 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                        { label: 'In Progress', value: stats?.in_progress_deliveries || 0, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-blue-100', iconColor: 'text-blue-600' },
                        { label: 'Pending', value: stats?.pending_deliveries || 0, icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-indigo-100', iconColor: 'text-[#4F46E5]' }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-xs font-semibold text-slate-700">Recent Deliveries</span>
                        </div>
                        <Link 
                            href="/operational-manager/recent-deliveries"
                            className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b border-slate-100">
                                    {['ID', 'Customer', 'Status', 'Date', 'Actions'].map((header) => (
                                        <th key={header} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentDeliveries && recentDeliveries.length > 0 ? (
                                    recentDeliveries.slice(0, 5).map((delivery) => (
                                        <tr key={delivery.id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs font-medium text-slate-800">#{delivery.id}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-600">{delivery.customer}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-md ${
                                                    delivery.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    delivery.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {delivery.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-500">{delivery.date}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]">View</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-8 text-center">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">No recent deliveries</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3">
                    <Link 
                        href="/operational-manager/deliveries"
                        className="bg-white rounded-xl border border-slate-200 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-[#4F46E5] transition-colors">New Delivery</p>
                                <p className="text-[10px] text-slate-500">Create request</p>
                            </div>
                        </div>
                    </Link>
                    <Link 
                        href="/operational-manager/clients"
                        className="bg-white rounded-xl border border-slate-200 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-[#4F46E5] transition-colors">Clients</p>
                                <p className="text-[10px] text-slate-500">Manage clients</p>
                            </div>
                        </div>
                    </Link>
                    <Link 
                        href="/operational-manager/drivers"
                        className="bg-white rounded-xl border border-slate-200 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-[#4F46E5] transition-colors">Drivers</p>
                                <p className="text-[10px] text-slate-500">View drivers</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </OperationalManagerLayout>
    );
}
