import React from 'react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Truck, Wrench, Activity } from 'lucide-react';

export default function Dashboard({ authUser, userInfo, officeStaff, stats }) {
    return (
        <OfficeStaffLayout title="Dashboard" authUser={authUser} activeMenu="dashboard">
            <DashboardContent authUser={authUser} userInfo={userInfo} officeStaff={officeStaff} stats={stats} />
        </OfficeStaffLayout>
    );
}

function StatCard({ title, value, icon: Icon, trend, colorClass }) {
    return (
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300 ${colorClass}`} />
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 ${colorClass.replace('bg-', 'text-')}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                {trend && (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
    );
}

function DashboardContent({ authUser, stats }) {
    const weeklyAttendance = stats?.weekly_attendance || [];
    const truckStatuses = stats?.truck_statuses || [];

    return (
        <div className="min-h-screen pb-12">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Overview</h1>
                <p className="text-slate-500 font-medium text-lg">Welcome back, {authUser?.firstname || 'Staff'}! Here is your daily fleet summary.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Mechanics" value={stats?.total_mechanics || 0} icon={Users} colorClass="bg-indigo-500" trend="Active" />
                <StatCard title="Pending Maintenance" value={stats?.pending_maintenance || 0} icon={Wrench} colorClass="bg-rose-500" trend="Action Needed" />
                <StatCard title="Total Fleet Size" value={stats?.total_trucks || 0} icon={Truck} colorClass="bg-blue-500" />
                <StatCard title="Available Trucks" value={stats?.available_trucks || 0} icon={Activity} colorClass="bg-emerald-500" trend="Ready" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Chart - Line instead of Bar */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Attendance Trends</h2>
                            <p className="text-sm text-slate-500 mt-1">7-day mechanic presence overview</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Line type="monotone" dataKey="Present" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#10B981' }} />
                                <Line type="monotone" dataKey="Late" stroke="#F59E0B" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#F59E0B' }} />
                                <Line type="monotone" dataKey="Absent" stroke="#EF4444" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#EF4444' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Truck Status Donut */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Fleet Status</h2>
                        <p className="text-sm text-slate-500 mt-1">Current truck distribution</p>
                    </div>
                    <div className="h-[280px] w-full flex items-center justify-center">
                        {truckStatuses.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={truckStatuses}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {truckStatuses.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <Truck className="w-10 h-10 mb-2 opacity-30" />
                                <span className="text-sm font-medium">No fleet data</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

