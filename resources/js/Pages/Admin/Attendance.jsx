import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Attendance({ authUser }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([
        { id: 1, name: 'John Doe', role: 'Driver', status: 'present', checkIn: '08:00 AM', checkOut: '05:00 PM' },
        { id: 2, name: 'Jane Smith', role: 'Office Staff', status: 'present', checkIn: '08:15 AM', checkOut: '-' },
        { id: 3, name: 'Mike Johnson', role: 'Driver', status: 'absent', checkIn: '-', checkOut: '-' },
        { id: 4, name: 'Sarah Williams', role: 'Operation Manager', status: 'present', checkIn: '07:45 AM', checkOut: '04:30 PM' },
    ]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'present': return 'bg-emerald-100 text-emerald-700';
            case 'absent': return 'bg-red-100 text-red-700';
            case 'late': return 'bg-amber-100 text-amber-700';
            case 'on_leave': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const stats = [
        { label: 'Present', value: 12, color: 'from-emerald-500 to-teal-500', icon: 'M5 13l4 4L19 7' },
        { label: 'Absent', value: 2, color: 'from-red-500 to-pink-500', icon: 'M6 18L18 6M6 6l12 12' },
        { label: 'Late', value: 1, color: 'from-amber-500 to-orange-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'On Leave', value: 3, color: 'from-blue-500 to-indigo-500', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    return (
        <AdminLayout title="Attendance" authUser={authUser} activeMenu="attendance" pendingDeliveries={0}>
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card-hover bg-white rounded-2xl p-6 shadow-lg border border-amber-100/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Date Selection and Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                        <div className="pt-6">
                            <span className="text-sm text-gray-500">
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button className="btn-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Mark Attendance</span>
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="card-hover bg-white rounded-2xl shadow-lg border border-amber-100/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gradient-to-r from-gray-50 to-amber-50/30">
                                <tr>
                                    {['Employee', 'Role', 'Status', 'Check In', 'Check Out', 'Actions'].map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {attendanceData.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                                                    <span className="text-white font-semibold">{employee.name.charAt(0)}</span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-semibold text-gray-800">{employee.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {String(employee.id).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-700">
                                                {employee.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(employee.status)}`}>
                                                {employee.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {employee.checkIn}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {employee.checkOut}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-hover bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-lg">Bulk Mark</h4>
                                <p className="text-amber-100 text-sm mt-1">Mark attendance for multiple employees</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card-hover bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-lg">Leave Requests</h4>
                                <p className="text-emerald-100 text-sm mt-1">5 pending requests to review</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card-hover bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-lg">Monthly Report</h4>
                                <p className="text-blue-100 text-sm mt-1">View detailed attendance analytics</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
