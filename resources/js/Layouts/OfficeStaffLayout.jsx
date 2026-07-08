import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    CalendarClock, 
    BadgeDollarSign, 
    Wrench, 
    PackageSearch, 
    FileBarChart, 
    Bell, 
    Settings, 
    Users, 
    LogOut,
    Menu,
    ChevronRight,
    Truck,
    LifeBuoy
} from 'lucide-react';

const icons = {
    dashboard: LayoutDashboard,
    attendance: CalendarClock,
    payroll: BadgeDollarSign,
    maintenance: Wrench,
    inventory: PackageSearch,
    reports: FileBarChart,
    notifications: Bell,
    settings: Settings,
    employees: Users,
    truck: Truck,
    rescue: LifeBuoy
};

// Icon component
function Icon({ name, className = 'w-5 h-5' }) {
    const LucideIcon = icons[name] || LayoutDashboard;
    return <LucideIcon className={className} strokeWidth={1.5} />;
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
                className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-500/10 transition-all duration-300"
                title="Logout"
            >
                <LogOut className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* Logout Confirmation Modal */}
            {showConfirm && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={handleCancel} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 opacity-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-100 shadow-sm">
                                <LogOut className="w-8 h-8 text-rose-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Confirm Logout</h3>
                                <p className="text-sm text-slate-500">Are you sure you want to securely end your session?</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-semibold w-full"
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
                                className="px-5 py-2.5 text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30 text-sm font-semibold w-full"
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
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', href: '/office-staff/dashboard' },
        { id: 'attendance', name: 'Attendance', icon: 'attendance', href: '/office-staff/attendance' },
        { id: 'payroll', name: 'Payroll', icon: 'payroll', href: '/office-staff/payroll' },
        { id: 'maintenance', name: 'Maintenance', icon: 'maintenance', href: '/office-staff/maintenance' },
        { id: 'rescue', name: 'Rescue Dispatch', icon: 'rescue', href: '/office-staff/rescue-dispatch' },
        { id: 'inventory', name: 'Inventory', icon: 'inventory', href: '/office-staff/inventory' },
        { id: 'reports', name: 'Reports', icon: 'reports', href: '/office-staff/reports' },
        { id: 'notifications', name: 'Notifications', icon: 'notifications', href: '#', badge: 2 },
        { id: 'settings', name: 'Settings', icon: 'settings', href: '/office-staff/settings' },
    ];

    return (
        <div className="w-[280px] h-screen bg-[#0F172A] p-6 flex flex-col fixed left-0 top-0 z-50 shadow-2xl border-r border-white/5">
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-12 pl-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Icon name="employees" className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-white font-black text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">DTS</h1>
                    <p className="text-indigo-300/80 text-xs font-medium tracking-wider uppercase mt-0.5">Staff Portal</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pb-6 pr-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pl-4">Menu</div>
                {menuItems.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                                isActive 
                                    ? 'bg-indigo-600/10 text-indigo-400' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                            )}
                            <Icon name={item.icon} className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`} />
                            <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                            {item.badge && (
                                <span className="ml-auto px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-rose-500/40">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profile Section */}
            <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-2xl p-3 flex flex-col gap-3 border border-slate-700/50 backdrop-blur-md transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-inner">
                            <span className="text-white font-bold text-sm">
                                {(authUser?.username || 'S').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm font-bold truncate">{authUser?.username || 'Staff'}</p>
                            <p className="text-slate-500 text-xs font-medium truncate flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                Online
                            </p>
                        </div>
                        <LogoutButton />
                    </div>
                    
                    <div className="border-t border-slate-700/50 pt-2 flex justify-center items-center gap-4">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Profile Settings
                        </Link>
                        <span className="text-white/10">|</span>
                        <Link
                            href="/force-change-password"
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
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

export default function OfficeStaffLayout({ children, title, authUser, activeMenu }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [rescueAlert, setRescueAlert] = useState(null);

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('rescues')
            .listen('RescueRequestSubmitted', (e) => {
                setRescueAlert(e);
            });

        return () => {
            if (window.Echo) window.Echo.leaveChannel('rescues');
        };
    }, []);

    return (
        <>
            <Head title={title || 'Office Staff Dashboard'} />
            
            {/* Global Rescue Alert Toast */}
            {rescueAlert && (
                <div className="fixed top-4 right-4 z-[999999] bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 max-w-sm animate-bounce">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg">Rescue Request!</h4>
                        <p className="text-sm text-red-100">{rescueAlert.driverName} reported: {rescueAlert.issueCategory}</p>
                        <Link href="/office-staff/rescue-dispatch" className="mt-2 inline-block bg-white text-red-600 text-xs font-bold px-3 py-1 rounded hover:bg-red-50">View Details</Link>
                    </div>
                    <button onClick={() => setRescueAlert(null)} className="text-white hover:text-red-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

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
                <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
                    {/* Mobile Header */}
                    <div className="lg:hidden bg-[#0F172A] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Icon name="employees" className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="font-bold tracking-wide">DTS Staff</h1>
                        </div>
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-white/80 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Page Content */}
                    <main className="flex-1 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
