import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link } from '@inertiajs/react';

// Icon component
function Icon({ name, className = 'w-5 h-5' }) {
    const icons = {
        dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        orders: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
        suppliers: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        inventory: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        reports: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        'lock-closed': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
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
                className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-all duration-300 group"
                title="Logout"
            >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>

            {/* Logout Confirmation Modal */}
            {showConfirm && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={handleCancel} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100/50 animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                                    <svg className="w-8 h-8 text-rose-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Sign Out</h3>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Are you sure you want to end your current session?</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold tracking-wide"
                                >
                                    Cancel
                                </button>
                                <Link
                            href="/profile"
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Profile
                        </Link>
                        <span className="text-white/10 mx-2">|</span>
                        <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    type="button"
                                    className="flex-1 px-4 py-3 text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/30 text-sm font-bold tracking-wide"
                                >
                                    Sign Out
                                </Link>
                            </div>
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
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', href: '/purchaser/dashboard' },
        { id: 'orders', name: 'Purchase Orders', icon: 'orders', href: '/purchaser/orders' },
        { id: 'suppliers', name: 'Suppliers', icon: 'suppliers', href: '/purchaser/suppliers' },
        { id: 'inventory', name: 'Inventory', icon: 'inventory', href: '/purchaser/inventory' },
        { id: 'reports', name: 'Reports', icon: 'reports', href: '/purchaser/reports' },
        { id: 'settings', name: 'Settings', icon: 'settings', href: '/purchaser/settings' },
    ];

    return (
        <div className="w-[280px] h-screen bg-slate-950/95 backdrop-blur-2xl p-6 flex flex-col fixed left-0 top-0 z-50 rounded-r-[2.5rem] border-r border-white/5 shadow-[8px_0_32px_rgba(0,0,0,0.3)]">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon name="orders" className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                    <h1 className="text-white font-black text-xl leading-tight tracking-tight group-hover:text-purple-400 transition-colors">DTS</h1>
                    <p className="text-purple-500/80 text-[10px] uppercase font-bold tracking-[0.2em]">Purchaser Portal</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                                isActive 
                                    ? 'bg-gradient-to-r from-purple-500/15 to-purple-500/5 text-purple-400 border border-purple-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            )}
                            <Icon name={item.icon} className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-purple-400 scale-110' : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-110'}`} />
                            <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium group-hover:translate-x-1 transition-transform duration-300'}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-8 pt-6 border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex flex-col gap-3 backdrop-blur-md transition-colors">
                    <div className="flex items-center gap-3">
                        {authUser?.profile_image ? (
                            <img src={authUser.profile_image} alt="Profile" className="w-10 h-10 rounded-xl object-cover shadow-inner" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-inner relative">
                                <div className="absolute inset-0 bg-white/20 rounded-xl" />
                                <span className="text-white font-black text-sm relative z-10">
                                    {(authUser?.username || 'P').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-100 text-sm font-bold truncate tracking-wide">{authUser?.username || 'Purchaser'}</p>
                            <p className="text-purple-500/70 text-[10px] uppercase font-bold tracking-wider truncate">Purchaser</p>
                        </div>
                        <LogoutButton />
                    </div>

                    <div className="border-t border-white/5 pt-2 flex justify-center items-center gap-4">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-purple-400 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Profile Settings
                        </Link>
                        <span className="text-white/10">|</span>
                        <Link
                            href="/force-change-password"
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-purple-400 transition-colors"
                        >
                            <Icon name="lock-closed" className="w-3.5 h-3.5" />
                            Change Password
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PurchaserLayout({ children, title, authUser, activeMenu }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title={title || 'Purchaser Dashboard'} />
            
            <div className="min-h-screen bg-slate-50 flex selection:bg-purple-500/30">
                {/* Global Background Pattern */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100 to-transparent" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block relative z-20">
                    <Sidebar activeMenu={activeMenu} authUser={authUser} />
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 lg:hidden animate-in slide-in-from-left-60 duration-300">
                            <Sidebar activeMenu={activeMenu} authUser={authUser} />
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px] relative z-10">
                    {/* Header for mobile view */}
                    <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                                <Icon name="orders" className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-slate-900 font-black text-lg tracking-tight">DTS</span>
                                <p className="text-purple-600 text-[9px] uppercase font-bold tracking-widest leading-none">Purchaser</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2.5 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h8" />
                            </svg>
                        </button>
                    </header>
                    
                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </>
    );
}
