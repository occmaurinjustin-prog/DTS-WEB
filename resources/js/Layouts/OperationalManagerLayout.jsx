import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link } from '@inertiajs/react';

// Icon component
function Icon({ name, className = 'w-5 h-5' }) {
    const icons = {
        dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        drivers: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
        clients: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        deliveries: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        trucks: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        tracking: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
        reports: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    };
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icons[name]} />
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

// Sidebar Component
function Sidebar({ activeMenu, authUser }) {
    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', href: '/operational-manager/dashboard' },
        { id: 'drivers', name: 'Driver List', icon: 'drivers', href: '/operational-manager/drivers' },
        { id: 'clients', name: 'Clients', icon: 'clients', href: '/operational-manager/clients' },
        { id: 'deliveries', name: 'Deliveries', icon: 'deliveries', href: '/operational-manager/deliveries' },
        { id: 'trucks', name: 'Trucks', icon: 'trucks', href: '/operational-manager/trucks' },
        { id: 'tracking', name: 'Tracking', icon: 'tracking', href: '#', live: true },
        { id: 'reports', name: 'Reports', icon: 'reports', href: '/operational-manager/reports' },
        { id: 'notifications', name: 'Notifications', icon: 'notifications', href: '#', badge: 3 },
        { id: 'settings', name: 'Settings', icon: 'settings', href: '/operational-manager/settings' },
    ];

    return (
        <div className="w-[260px] h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] p-5 flex flex-col fixed left-0 top-0 z-50 rounded-r-[20px]">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-[#4F46E5]/30">
                    <Icon name="trucks" className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-tight">DTS</h1>
                    <p className="text-gray-400 text-xs">Manager Portal</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                isActive 
                                    ? 'bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/25' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icon name={item.icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            <span className="text-sm font-medium">{item.name}</span>
                            {item.live && (
                                <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                                    LIVE
                                </span>
                            )}
                            {item.badge && !item.live && (
                                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                            {(authUser?.username || 'M').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{authUser?.username || 'Manager'}</p>
                        <p className="text-gray-400 text-xs truncate">Operations Manager</p>
                    </div>
                    <LogoutButton />
                </div>
                <div className="mt-4 flex items-center gap-2 px-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">System Online</span>
                </div>
            </div>
        </div>
    );
}

export default function OperationalManagerLayout({ children, title, authUser, activeMenu }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title={title || 'Operational Manager Dashboard'} />
            
            <div className="min-h-screen bg-[#F5F7FB] flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <Sidebar activeMenu={activeMenu} authUser={authUser} />
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                            <Sidebar activeMenu={activeMenu} authUser={authUser} />
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
                    {/* Header */}
                    

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
