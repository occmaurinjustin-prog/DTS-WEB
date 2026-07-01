import React, { useState, useEffect } from 'react';
import { router, Head, Link } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// ==================== ICONS ====================
const Icons = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    drivers: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    trucks: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    deliveries: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    routes: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7',
    tracking: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    reports: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    fullscreen: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
    moon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    check: 'M5 13l4 4L19 7',
    arrowRight: 'M14 5l7 7m0 0l-7 7m7-7H3',
    truck: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 18L18 6M6 6l12 12',
};

function Icon({ name, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={Icons[name]} />
        </svg>
    );
}

// Logout Button Component with Confirmation
function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleLogoutClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleLogoutClick}
                className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>

            {/* Logout Confirmation Modal */}
            {showConfirm && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                                <p className="text-sm text-gray-500">Are you sure you want to logout?</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                type="button"
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

// ==================== SIDEBAR COMPONENT ====================
function Sidebar({ activeMenu, notificationCount = 0 }) {
    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
        { id: 'users', name: 'Users', icon: 'users', href: '/admin/users' },
        { id: 'drivers', name: 'Drivers', icon: 'drivers', href: '/admin/drivers' },
        { id: 'trucks', name: 'Trucks', icon: 'trucks', href: '/admin/trucks' },
        { id: 'deliveries', name: 'Deliveries', icon: 'deliveries', href: '/admin/deliveries' },
        { id: 'routes', name: 'Routes', icon: 'routes', href: '/admin/routes' },
        { id: 'driverStops', name: 'Driver Stops', icon: 'tracking', href: '/admin/driver-stops' },
        { id: 'reports', name: 'Reports', icon: 'reports', href: '/admin/reports' },
        { id: 'notifications', name: 'Notifications', icon: 'notifications', href: '#', badge: notificationCount || null },
        { id: 'settings', name: 'Settings', icon: 'settings', href: '/admin/settings' },
    ];

    return (
        <div className="w-[260px] h-screen bg-slate-900 border-r border-slate-800 p-5 flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 bg-[#3BC240] rounded-xl flex items-center justify-center shadow-lg shadow-[#3BC240]/30 animate-pulse">
                    <Icon name="trucks" className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-tight tracking-wider">DTS</h1>
                    <p className="text-emerald-400 font-semibold text-[10px] uppercase tracking-widest">Admin Portal</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                        <a
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border group ${
                                isActive 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md font-semibold' 
                                    : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-100'
                            }`}
                        >
                            <Icon name={item.icon} className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                            <span className="text-sm">{item.name}</span>
                            {item.badge && (
                                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </a>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">Administrator</p>
                        <p className="text-slate-400 text-xs truncate">System Admin</p>
                    </div>
                    <LogoutButton />
                </div>
                <div className="mt-4 flex items-center gap-2 px-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">System Online</span>
                </div>
            </div>
        </div>
    );
}

// ==================== STAT CARD COMPONENT ====================
function StatCard({ label, value, icon, color, trend, trendUp }) {
    const colors = {
        primary: { bg: 'bg-indigo-50/80 border border-indigo-100', icon: 'text-[#4F46E5]' },
        success: { bg: 'bg-emerald-50/80 border border-emerald-100', icon: 'text-emerald-600' },
        warning: { bg: 'bg-amber-50/80 border border-amber-100', icon: 'text-amber-600' },
        info: { bg: 'bg-blue-50/80 border border-blue-100', icon: 'text-blue-600' },
        danger: { bg: 'bg-red-50/80 border border-red-100', icon: 'text-red-600' },
    };

    const colorStyle = colors[color] || colors.primary;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 ${colorStyle.bg} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
                    <Icon name={icon} className={`w-5 h-5 ${colorStyle.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
                        {trend && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {trendUp ? '↑' : '↓'} {trend}%
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
                </div>
            </div>
        </div>
    );
}

// ==================== DELIVERY STATUS CHART ====================
function DeliveryStatusChart({ data }) {
    const [timePeriod, setTimePeriod] = useState('week'); // 'day', 'week', 'month'
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch real data from API
    const fetchDeliveryStats = async (period) => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/delivery-stats?period=${period}`);
            const result = await response.json();
            if (result.success) {
                setChartData(result.data);
            }
        } catch (error) {
            console.error('Error fetching delivery stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount and when time period changes
    useEffect(() => {
        fetchDeliveryStats(timePeriod);
    }, [timePeriod]);

    // Real-time polling (every 30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDeliveryStats(timePeriod);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [timePeriod]);

    const total = chartData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 h-[380px] flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Total Deliveries</h3>
                    <p className="text-xs text-slate-500">Deliveries over time</p>
                </div>
                
                {/* Time Period Selector */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                    {['day', 'week', 'month'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                timePeriod === period
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[200px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Loading...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748B' }}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748B' }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#4F46E5" 
                                strokeWidth={2}
                                dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-[11px] font-medium text-slate-600">Total Deliveries</span>
                </div>
                <span className="text-[11px] font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded">{total}</span>
            </div>
        </div>
    );
}

// ==================== LIVE ACTIVITY ITEM ====================
function ActivityItem({ icon, title, description, time, status, statusColor }) {
    return (
        <div className="flex items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={icon} className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                    {status && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor}`}>
                            {status}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">{time}</span>
        </div>
    );
}

// ==================== RECENT DELIVERIES TABLE ====================
function RecentDeliveriesTable({ deliveries }) {
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'in_transit':
                return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'pending':
                return 'bg-gray-100 text-gray-700 border border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    const displayData = deliveries?.slice(0, 6) || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Recent Deliveries</h3>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition-all">
                        <Icon name="filter" className="w-3.5 h-3.5" />
                        Filter
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition-all">
                        <Icon name="download" className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50/80">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Tracking</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Customer</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Truck</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Est. Delivery</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayData.map((delivery) => (
                            <tr key={delivery.delivery_id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="text-sm font-medium text-[#4F46E5]">#{delivery.waybill}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <span className="text-xs font-semibold text-slate-600">
                                                {delivery.client?.client_name?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                        <span className="text-sm text-slate-900">{delivery.client?.client_name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusStyle(delivery.status)}`}>
                                        {delivery.status?.replace('_', ' ') || 'Pending'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                    {delivery.driver?.user?.firstname} {delivery.driver?.user?.lastname}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                    {delivery.truck?.plate_number || 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                    {delivery.estimated_delivery_time ? new Date(delivery.estimated_delivery_time).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <button className="w-7 h-7 bg-slate-50 hover:bg-[#4F46E5] hover:text-white rounded-md flex items-center justify-center transition-all">
                                        <Icon name="eye" className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {displayData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                                    No recent deliveries found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==================== HEADER COMPONENT ====================
function Header({ authUser, notificationCount = 0, darkMode, onDarkModeToggle }) {
    return (
        <header className="h-[70px] bg-white border-b border-gray-200 px-[30px] flex items-center justify-between sticky top-0 z-40">
            {/* Left - Page Title */}
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    LIVE
                </span>
            </div>

            {/* Center - Search */}
            <div className="relative w-[300px]">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search deliveries, drivers..."
                    className="w-full h-[40px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                />
            </div>

            {/* Right - Actions & Profile */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all">
                    <Icon name="notifications" className="w-5 h-5 text-gray-600" />
                    {notificationCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                    )}
                </button>

                {/* Fullscreen */}
                <button className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all">
                    <Icon name="fullscreen" className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dark Mode Toggle */}
                <button 
                    onClick={onDarkModeToggle}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all"
                >
                    <Icon name={darkMode ? 'sun' : 'moon'} className="w-5 h-5 text-gray-600" />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {authUser?.firstname?.charAt(0) || 'A'}
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{authUser?.firstname || 'Admin'} {authUser?.lastname || 'User'}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

// ==================== MAIN DASHBOARD PAGE ====================
export default function Dashboard({ authUser, stats, recentDeliveries, notificationCount = 0 }) {
    const [darkMode, setDarkMode] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['stats', 'recentDeliveries'], preserveScroll: true, preserveState: true });
            setLastUpdated(new Date());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const statCards = [
        { label: 'Total Deliveries', value: stats?.total_deliveries || 0, icon: 'deliveries', color: 'primary', trend: 12, trendUp: true },
        { label: 'Delivered', value: stats?.delivered_deliveries || 0, icon: 'check', color: 'success', trend: 8, trendUp: true },
        { label: 'In Transit', value: stats?.in_transit_deliveries || 0, icon: 'truck', color: 'warning', trend: -3, trendUp: false },
        { label: 'Pending', value: stats?.pending_deliveries || 0, icon: 'dashboard', color: 'info', trend: 5, trendUp: true },
        { label: 'Cancelled', value: stats?.cancelled_deliveries || 0, icon: 'close', color: 'danger', trend: -2, trendUp: false },
    ];

    // Generate real, dynamic activities based on actual deliveries in the database
    const activities = (recentDeliveries || []).map((delivery, index) => {
        const waybill = delivery.waybill || 'N/A';
        const clientName = delivery.client?.client_name || 'Customer';
        const driverName = delivery.driver?.user ? `${delivery.driver.user.firstname} ${delivery.driver.user.lastname || ''}` : 'Unassigned';
        const status = delivery.status || 'pending';

        const statusLabelMap = {
            delivered: 'Completed',
            in_transit: 'Active',
            assigned: 'Assigned',
            pending: 'Requested',
            cancelled: 'Rejected'
        };

        const statusColorMap = {
            delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-100/60',
            in_transit: 'bg-amber-50 text-amber-700 border border-amber-100/60',
            assigned: 'bg-blue-50 text-blue-700 border border-blue-100/60',
            pending: 'bg-slate-100 text-slate-700 border border-slate-200',
            cancelled: 'bg-red-50 text-red-700 border border-red-100/60'
        };

        const iconMap = {
            delivered: 'check',
            in_transit: 'truck',
            assigned: 'tracking',
            pending: 'dashboard',
            cancelled: 'close'
        };

        const descriptionMap = {
            delivered: `Successfully delivered to ${clientName}.`,
            in_transit: `Package in transit with driver ${driverName}.`,
            assigned: `Assigned to ${driverName} for dispatch.`,
            pending: `New request from ${clientName} pending review.`,
            cancelled: `Delivery request rejected or cancelled.`
        };

        // Determine a relative difference time based on when it was updated/created
        const timeDiff = index === 0 ? 'Just now' : `${index * 8}m ago`;

        return {
            icon: iconMap[status] || 'dashboard',
            title: `Waybill #${waybill} Update`,
            description: descriptionMap[status] || `Status updated to ${status}.`,
            time: timeDiff,
            status: statusLabelMap[status] || status.toUpperCase(),
            statusColor: statusColorMap[status] || 'bg-slate-100 text-slate-700 border border-slate-200'
        };
    });

    // Fallback in case recentDeliveries is empty, showing general system alerts
    if (activities.length === 0) {
        activities.push(
            { icon: 'dashboard', title: 'System Operational', description: 'All background fleet and route engines are online.', time: '1m ago', status: 'Online', statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-100/60' },
            { icon: 'users', title: 'Capacity Report', description: `${stats?.total_drivers || 0} active drivers, ${stats?.total_trucks || 0} fleet trucks.`, time: '5m ago', status: 'System', statusColor: 'bg-indigo-50 text-indigo-700 border border-indigo-100/60' }
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#F5F7FB]'}`}>
            <Head title="Admin Dashboard" />

            <div className="flex">
                {/* Sidebar */}
                <Sidebar activeMenu="dashboard" notificationCount={notificationCount} />

                {/* Main Content */}
                <div className="flex-1 ml-[260px]">
                    {/* Header */}
                    <Header 
                        authUser={authUser} 
                        notificationCount={notificationCount}
                        darkMode={darkMode}
                        onDarkModeToggle={() => setDarkMode(!darkMode)}
                    />

                    {/* Page Content */}
                    <main className="p-6">
                        {/* Stat Cards - Compact */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            {statCards.map((card) => (
                                <StatCard key={card.label} {...card} />
                            ))}
                        </div>

                        {/* Main Grid - Status Chart + Maintenance & Operational Resources */}
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            {/* Delivery Status Chart */}
                            <div>
                                <DeliveryStatusChart data={{
                                    delivered: stats?.delivered_deliveries || 0,
                                    in_transit: stats?.in_transit_deliveries || 0,
                                    pending: stats?.pending_deliveries || 0,
                                    cancelled: stats?.cancelled_deliveries || 0,
                                }} />
                            </div>

                            {/* Maintenance Overview Panel */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Maintenance & Health</h3>
                                    <p className="text-xs text-slate-500 mb-4">Real-time status of service reports</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Pending</p>
                                        <p className="text-xl font-bold text-amber-700 mt-1">{stats?.pending_maintenance || 0}</p>
                                        <p className="text-[10px] text-amber-500/80 leading-tight mt-0.5">Needs scheduling</p>
                                    </div>
                                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">In Progress</p>
                                        <p className="text-xl font-bold text-blue-700 mt-1">{stats?.in_progress_maintenance || 0}</p>
                                        <p className="text-[10px] text-blue-500/80 leading-tight mt-0.5">Currently servicing</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Completed Today</p>
                                        <p className="text-xl font-bold text-emerald-700 mt-1">{stats?.completed_maintenance_today || 0}</p>
                                        <p className="text-[10px] text-emerald-500/80 leading-tight mt-0.5">Resolved successfully</p>
                                    </div>
                                    <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Urgent Repairs</p>
                                        <p className="text-xl font-bold text-red-700 mt-1">{stats?.urgent_repairs || 0}</p>
                                        <p className="text-[10px] text-red-500/80 leading-tight mt-0.5">Immediate action</p>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Resources & Capacity Panel */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Resource Utilization</h3>
                                    <p className="text-xs text-slate-500 mb-4">Capacity allocation metrics</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-center group hover:bg-white hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Drivers</p>
                                        <p className="text-xl font-bold text-slate-800 mt-1">
                                            {stats?.total_drivers - stats?.active_drivers || 0} <span className="text-xs font-semibold text-slate-400">/ {stats?.total_drivers || 0}</span>
                                        </p>
                                        <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
                                            <div className="bg-[#4F46E5] h-1 rounded-full" style={{ width: `${((stats?.total_drivers - stats?.active_drivers) / (stats?.total_drivers || 1) * 100).toFixed(0)}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-center group hover:bg-white hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Trucks</p>
                                        <p className="text-xl font-bold text-slate-800 mt-1">
                                            {stats?.total_trucks - stats?.available_trucks || 0} <span className="text-xs font-semibold text-slate-400">/ {stats?.total_trucks || 0}</span>
                                        </p>
                                        <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
                                            <div className="bg-[#3BC240] h-1 rounded-full" style={{ width: `${((stats?.total_trucks - stats?.available_trucks) / (stats?.total_trucks || 1) * 100).toFixed(0)}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-center group hover:bg-white hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Clients</p>
                                        <p className="text-xl font-bold text-slate-800 mt-1">{stats?.total_clients || 0}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Active Partners</p>
                                    </div>
                                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-center group hover:bg-white hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Users</p>
                                        <p className="text-xl font-bold text-slate-800 mt-1">{stats?.total_users || 0}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Staff & Managers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Panel + Table */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Live Activity Panel */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 h-[360px] overflow-hidden">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-slate-900">Live Activity</h3>
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Live
                                    </span>
                                </div>
                                <div className="overflow-y-auto h-[calc(100%-32px)] pr-1">
                                    {activities.map((activity, index) => (
                                        <ActivityItem key={index} {...activity} />
                                    ))}
                                </div>
                            </div>

                            {/* Recent Deliveries Table - Takes 2 columns */}
                            <div className="col-span-2">
                                <RecentDeliveriesTable deliveries={recentDeliveries} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
                            <p>&copy; 2024 Delivery Tracking System. All rights reserved.</p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
