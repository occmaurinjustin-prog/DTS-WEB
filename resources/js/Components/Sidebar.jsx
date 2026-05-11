import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { createPortal } from 'react-dom';

// Logout Button Component with Confirmation
function LogoutButton({ sidebar = false }) {
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
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    sidebar 
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
                        : 'text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50'
                }`}
                title="Logout"
            >
                <div className={`flex items-center justify-center ${sidebar ? 'w-10 h-10 rounded-xl bg-white/10' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>
                {sidebar && <span>Logout</span>}
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

// Sidebar Component - High-End Premium Professional Navigation
export default function Sidebar({ 
    menuItems, 
    activeMenu, 
    portalName = 'Portal', 
    portalSubtitle = 'Delivery System',
    logoImage = '/images/dts_logo.png'
}) {
    const [hoveredItem, setHoveredItem] = useState(null);

    // Group menu items by section if provided
    const groupedItems = menuItems.reduce((acc, item) => {
        const section = item.section || 'Main';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    return (
        <div className="h-screen w-72 bg-white border-r border-gray-200 flex flex-col relative overflow-hidden shadow-lg">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white/50 pointer-events-none" />
            
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            {/* Logo Section - Clean Minimal */}
            <div className="relative z-10 flex items-center gap-4 px-5 py-5 border-b border-gray-200">
                {/* Logo */}
                <div className="relative group cursor-pointer flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white ring-2 ring-gray-200 shadow-md">
                        <img 
                            src={logoImage}
                            alt={portalName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/images/dts_logo.png';
                            }}
                        />
                    </div>
                </div>

                {/* Portal Name & Subtitle */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-semibold text-gray-900 tracking-tight truncate">
                        {portalName}
                    </h1>
                    <p className="text-[10px] font-medium text-gray-500 tracking-wide uppercase">{portalSubtitle}</p>
                </div>
            </div>

            {/* Premium Navigation Menu - No Scrollbar */}
            <nav className="relative z-10 flex-1 py-4 px-3 overflow-hidden">
                {Object.entries(groupedItems).map(([section, items], sectionIndex) => (
                    <div key={section} className={sectionIndex > 0 ? 'mt-4' : ''}>
                        {section !== 'Main' && (
                            <div className="flex items-center gap-2 px-3 mb-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {section}
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                            </div>
                        )}
                        
                        <div className="space-y-1">
                            {items.map((item) => {
                                const isActive = activeMenu === item.id;
                                const isHovered = hoveredItem === item.id;
                                
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out group ${
                                            isActive
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        {/* Red Active Indicator - Left Accent Bar */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                                        )}
                                        
                                        {/* Icon Container - Minimal */}
                                        <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                                            isActive
                                                ? 'bg-blue-600 text-white'
                                                : isHovered
                                                    ? 'bg-gray-200 text-gray-700'
                                                    : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                            </svg>
                                        </div>

                                        {/* Label */}
                                        <span className="truncate font-medium">{item.name}</span>

                                        {/* Notification Badge */}
                                        {item.badge > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                        
                                        {/* Active Arrow Indicator */}
                                        {isActive && (
                                            <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer Section with Logout */}
            <div className="relative z-10 px-3 py-3 border-t border-gray-200 bg-gray-50">
                <LogoutButton sidebar={true} />
                <div className="flex items-center justify-between mt-2 px-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-gray-500">System Online</span>
                    </div>
                    <span className="text-[10px] text-gray-400">v2.0</span>
                </div>
            </div>
        </div>
    );
}
