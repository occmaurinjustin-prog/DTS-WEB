import React, { useEffect } from 'react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { router } from '@inertiajs/react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    Users, Truck, Wrench, Activity, AlertTriangle, ShieldCheck, 
    ShoppingCart, PackageSearch 
} from 'lucide-react';

export default function Dashboard({ authUser, userInfo, officeStaff, stats }) {
    useEffect(() => {
        if (!window.Echo) return;

        const handleReload = () => {
            router.reload({ only: ['stats'], preserveScroll: true, preserveState: true });
        };

        // Listen for real-time updates via Laravel Reverb WebSockets
        const rescuesChannel = window.Echo.channel('rescues')
            .listen('RescueRequestSubmitted', handleReload)
            .listen('RescueStatusUpdated', handleReload);

        const maintChannel = window.Echo.channel('maintenance')
            .listen('MaintenanceReportSubmitted', handleReload)
            .listen('MaintenanceStatusUpdated', handleReload);

        // Add additional channels if necessary

        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('rescues');
                window.Echo.leaveChannel('maintenance');
            }
        };
    }, []);

    return (
        <OfficeStaffLayout title="Dashboard Overview" authUser={authUser} activeMenu="dashboard">
            <DashboardContent authUser={authUser} userInfo={userInfo} officeStaff={officeStaff} stats={stats} />
        </OfficeStaffLayout>
    );
}

function StatCard({ title, value, icon: Icon, trend, trendType }) {
    return (
        <div className="p-4 border border-zinc-200 bg-white hover:shadow-sm transition-all group relative overflow-hidden">
            {trendType === 'urgent' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            )}
            {trendType === 'warning' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            )}
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
                <div className={`p-1.5 rounded-lg ${
                    trendType === 'urgent' ? 'bg-red-50 text-red-500' :
                    trendType === 'warning' ? 'bg-amber-50 text-amber-500' :
                    trendType === 'good' ? 'bg-emerald-50 text-emerald-500' :
                    'bg-zinc-50 text-zinc-500 group-hover:bg-zinc-100 group-hover:text-zinc-900'
                } transition-colors`}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{value}</h3>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide border ${
                        trendType === 'urgent' ? 'border-red-200 text-red-600 bg-red-50' : 
                        trendType === 'warning' ? 'border-amber-200 text-amber-600 bg-amber-50' : 
                        trendType === 'good' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 
                        'border-zinc-200 text-zinc-600 bg-zinc-50'
                    }`}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}

function DashboardContent({ authUser, stats }) {
    const weeklyAttendance = stats?.weekly_attendance || [];
    const truckStatuses = stats?.truck_statuses || [];

    // Premium Monochrome / Zinc palette
    const PIE_COLORS = ['#09090b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'];

    return (
        <div className="pb-12 pt-6 max-w-7xl">
            {/* High Priority Metrics Grid */}
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Operations & Fleet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Active Emergencies" 
                    value={stats?.active_rescues || 0} 
                    icon={AlertTriangle} 
                    trend={stats?.active_rescues > 0 ? "Urgent" : null} 
                    trendType={stats?.active_rescues > 0 ? "urgent" : "neutral"} 
                />
                <StatCard 
                    title="Pending Maintenance" 
                    value={stats?.pending_maintenance || 0} 
                    icon={Wrench} 
                    trend={stats?.pending_maintenance > 0 ? "Action Needed" : null} 
                    trendType={stats?.pending_maintenance > 0 ? "warning" : "neutral"} 
                />
                <StatCard 
                    title="Available Trucks" 
                    value={stats?.available_trucks || 0} 
                    icon={Truck} 
                    trend="Ready" 
                    trendType="good" 
                />
                <StatCard 
                    title="Total Fleet Size" 
                    value={stats?.total_trucks || 0} 
                    icon={Activity} 
                />
            </div>

            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Inventory & Staffing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Pending Part Requests" 
                    value={stats?.pending_part_requests || 0} 
                    icon={ShoppingCart} 
                    trend={stats?.pending_part_requests > 0 ? "Needs Approval" : null} 
                    trendType={stats?.pending_part_requests > 0 ? "warning" : "neutral"} 
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={stats?.low_stock_parts || 0} 
                    icon={PackageSearch} 
                    trend={stats?.low_stock_parts > 0 ? "Reorder" : null} 
                    trendType={stats?.low_stock_parts > 0 ? "urgent" : "neutral"} 
                />
                <StatCard 
                    title="Total Mechanics" 
                    value={stats?.total_mechanics || 0} 
                    icon={Users} 
                    trend="Active" 
                    trendType="good" 
                />
                <StatCard 
                    title="Total Rescues (All Time)" 
                    value={stats?.total_rescues || 0} 
                    icon={ShieldCheck} 
                />
            </div>
        </div>
    );
}
