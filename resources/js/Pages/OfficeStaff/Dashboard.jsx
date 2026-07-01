import React from 'react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Truck, Wrench, Activity, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard({ authUser, userInfo, officeStaff, stats }) {
    return (
        <OfficeStaffLayout title="Dashboard" authUser={authUser} activeMenu="dashboard">
            <DashboardContent authUser={authUser} userInfo={userInfo} officeStaff={officeStaff} stats={stats} />
        </OfficeStaffLayout>
    );
}

function StatCard({ title, value, icon: Icon, trend, colorClass }) {
    return (
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300 ${colorClass}`} />
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 ${colorClass.replace('bg-', 'text-')}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                {trend && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
    );
}

function DashboardContent({ authUser, stats }) {
    const weeklyAttendance = stats?.weekly_attendance || [];
    const truckStatuses = stats?.truck_statuses || [];

    return (
        <div className="min-h-screen pb-12">
            {/* Header Area */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back, {authUser?.firstname || 'Staff'}!</h1>
                <p className="text-slate-500 font-medium">Here's what's happening across the fleet today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Mechanics" value={stats?.total_mechanics || 0} icon={Users} colorClass="bg-indigo-500" trend="Active" />
                <StatCard title="Pending Maintenance" value={stats?.pending_maintenance || 0} icon={Wrench} colorClass="bg-amber-500" trend="Action Needed" />
                <StatCard title="Total Fleet Size" value={stats?.total_trucks || 0} icon={Truck} colorClass="bg-blue-500" />
                <StatCard title="Available Trucks" value={stats?.available_trucks || 0} icon={Activity} colorClass="bg-emerald-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Attendance Chart */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Attendance Trends</h2>
                            <p className="text-sm text-slate-500">Mechanic presence over the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: '#F1F5F9' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Bar dataKey="Present" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Late" stackId="a" fill="#F59E0B" />
                                <Bar dataKey="Absent" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Truck Status Donut */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="mb-2">
                        <h2 className="text-lg font-bold text-slate-900">Fleet Status</h2>
                        <p className="text-sm text-slate-500">Current truck distribution</p>
                    </div>
                    <div className="h-[280px] w-full flex items-center justify-center">
                        {truckStatuses.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={truckStatuses}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {truckStatuses.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <Truck className="w-10 h-10 mb-2 opacity-50" />
                                <span className="text-sm">No fleet data available</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="/office-staff/maintenance" className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                                    <Wrench className="w-6 h-6 text-white" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Maintenance</h3>
                                <p className="text-indigo-100 text-sm font-medium">Review pending reports</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </a>

                    <a href="/office-staff/inventory" className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                                    <Activity className="w-6 h-6 text-white" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Inventory</h3>
                                <p className="text-emerald-100 text-sm font-medium">Manage parts & supplies</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </a>

                    <a href="/office-staff/mechanic-attendance" className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                                    <Clock className="w-6 h-6 text-white" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Attendance</h3>
                                <p className="text-purple-100 text-sm font-medium">Monitor daily logs</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

