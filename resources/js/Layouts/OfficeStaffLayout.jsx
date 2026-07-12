import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, usePage } from '@inertiajs/react';
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
    return <LucideIcon className={className} strokeWidth={1.75} />;
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
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                title="Logout"
            >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">Logout</span>
            </button>

            {/* Logout Confirmation Modal */}
            {showConfirm && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleCancel} />
                    <div className="relative bg-white border border-zinc-200 shadow-xl max-w-sm w-full p-6 transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center border border-zinc-200">
                                <LogOut className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Sign Out</h3>
                                <p className="text-sm text-zinc-500">Are you sure you want to securely end your session?</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors text-sm font-medium w-full"
                            >
                                Cancel
                            </button>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                type="button"
                                className="px-4 py-2 text-white bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium w-full"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

function Header({ authUser, activeMenu, setMobileMenuOpen, pageTitle }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isProfileOpen && !e.target.closest('.profile-dropdown-container')) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    return (
        <header className="h-[60px] bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
            {/* Left - Page Title */}
            <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900">
                    <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight hidden sm:block">
                    {pageTitle || activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1).replace('_', ' ')}
                </h1>
            </div>

            {/* Right - Profile & Actions */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-zinc-200">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">System Active</span>
                </div>

                <div className="relative profile-dropdown-container">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:bg-zinc-50 p-1 pr-2 transition-colors border border-transparent hover:border-zinc-200"
                    >
                        {authUser?.profile_image ? (
                            <img src={authUser.profile_image} alt="Profile" className="w-8 h-8 object-cover border border-zinc-200" />
                        ) : (
                            <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-semibold text-sm">
                                {(authUser?.username || 'S').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-zinc-900 leading-none">{authUser?.username || 'Staff User'}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wide">Office Staff</p>
                        </div>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-lg py-1 z-50">
                            <div className="px-4 py-3 border-b border-zinc-100">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{authUser?.username || 'Staff User'}</p>
                                <p className="text-xs text-zinc-500 truncate">{authUser?.email || 'staff@example.com'}</p>
                            </div>
                            <div className="py-1">
                                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Account Settings
                                </Link>
                            </div>
                            <div className="border-t border-zinc-100 py-1">
                                <LogoutButton />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
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
        { id: 'part_requests', name: 'Part Requests', icon: 'maintenance', href: '/office-staff/part-requests' },
        { id: 'reports', name: 'Reports', icon: 'reports', href: '/office-staff/reports' },
        { id: 'settings', name: 'Settings', icon: 'settings', href: '/office-staff/settings' },
    ];

    return (
        <div className="w-[260px] h-screen bg-white p-4 flex flex-col fixed left-0 top-0 z-50 border-r border-zinc-200">
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center">
                    <span className="text-white font-black text-lg">DT</span>
                </div>
                <div>
                    <h1 className="text-zinc-900 font-bold tracking-widest text-sm uppercase">DTS System</h1>
                    <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-0.5">Staff Portal</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-2 mt-4">Menu</div>
                {menuItems.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                                isActive 
                                    ? 'bg-zinc-50 text-zinc-900 border border-zinc-200 font-semibold shadow-sm' 
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent'
                            }`}
                        >
                            <Icon name={item.icon} className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                            <span className="text-sm">{item.name}</span>
                            {item.badge && (
                                <span className="ml-auto px-1.5 py-0.5 bg-zinc-100 text-zinc-900 text-[10px] font-bold">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default function OfficeStaffLayout({ children, title, authUser, activeMenu, user }) {
    const { authUser: globalAuthUser, auth } = usePage().props;
    const finalAuthUser = authUser || user || auth?.user || globalAuthUser;
    
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
                <div className="fixed top-4 right-4 z-[999999] bg-zinc-900 border border-red-500 text-white p-4 shadow-xl flex items-start gap-4 max-w-sm">
                    <div className="bg-red-500/20 p-2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm text-red-400">Rescue Request</h4>
                        <p className="text-xs text-zinc-300 mt-1">{rescueAlert.driverName} reported: {rescueAlert.issueCategory}</p>
                        <Link href="/office-staff/rescue-dispatch" className="mt-3 inline-block border border-zinc-700 text-zinc-300 text-xs font-medium px-3 py-1 hover:bg-zinc-800 transition-colors">View Details</Link>
                    </div>
                    <button onClick={() => setRescueAlert(null)} className="text-zinc-500 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            <div className="min-h-screen bg-white flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-[260px] flex-shrink-0">
                    <Sidebar activeMenu={activeMenu} authUser={finalAuthUser} />
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                            <Sidebar activeMenu={activeMenu} authUser={finalAuthUser} />
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <Header 
                        authUser={finalAuthUser} 
                        activeMenu={activeMenu} 
                        setMobileMenuOpen={setMobileMenuOpen}
                        pageTitle={title}
                    />

                    {/* Page Content */}
                    <main className="flex-1 overflow-x-hidden p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
