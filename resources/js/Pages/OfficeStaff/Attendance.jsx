import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import { Search, Download, Calendar, MapPin, Clock, FileSpreadsheet, XCircle, User } from 'lucide-react';

export default function AttendanceIndex({ attendances, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [status, setStatus] = useState(filters.status || '');

    useEffect(() => {
        setSearch(filters.search || '');
        setDate(filters.date || '');
        setStatus(filters.status || '');
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/office-staff/attendance', { search, date, status }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setDate('');
        setStatus('');
        router.get('/office-staff/attendance');
    };

    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        const [hour, min] = timeString.split(':');
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${min} ${ampm}`;
    };

    const openMap = (lat, lng) => {
        if (lat && lng) {
            window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
        }
    };

    return (
        <OfficeStaffLayout activeMenu="attendance">
            <Head title="Attendance Management" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Attendance Logs</h1>
                        <p className="text-slate-500 font-medium">Monitor daily mechanic presence and locations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 font-semibold text-sm">
                            <Download className="w-4 h-4 text-indigo-500" /> Export PDF
                        </button>
                        <button className="px-4 py-2.5 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 font-semibold text-sm">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Excel
                        </button>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 mb-8 p-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4 text-slate-400" /> Search
                            </label>
                            <input 
                                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400"
                                type="text" 
                                placeholder="Employee Name or ID..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-56">
                            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" /> Date
                            </label>
                            <input 
                                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" /> Status
                            </label>
                            <select 
                                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Late">Late</option>
                                <option value="Half Day">Half Day</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <button type="submit" className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 font-bold text-sm">
                                <Search className="w-4 h-4" /> Filter
                            </button>
                            <button type="button" onClick={clearFilters} className="px-4 py-3 text-slate-500 bg-slate-100/80 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 font-bold text-sm">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5">Date & Employee</th>
                                    <th className="px-6 py-5">Morning Shift</th>
                                    <th className="px-6 py-5">Afternoon Shift</th>
                                    <th className="px-6 py-5">Work Hours</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {attendances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Calendar className="w-12 h-12 mb-4 opacity-20" strokeWidth={1} />
                                                <p className="text-base font-bold text-slate-600">No attendance records found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {record.user ? `${record.user.firstname || ''} ${record.user.lastname || ''}`.trim() || record.user.username : 'Unknown User'}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 font-medium">
                                                    {new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            
                                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-xs font-bold text-slate-400">IN</span>
                                                        <span className="font-semibold text-slate-700">{formatTime(record.morning_in)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'morning_in')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'morning_in');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'morning_in')?.address} className="text-indigo-400 hover:text-indigo-600 transition-colors bg-indigo-50 p-1 rounded-md">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-xs font-bold text-slate-400">OUT</span>
                                                        <span className="font-semibold text-slate-700">{formatTime(record.morning_out)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'morning_out')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'morning_out');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'morning_out')?.address} className="text-indigo-400 hover:text-indigo-600 transition-colors bg-indigo-50 p-1 rounded-md">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-xs font-bold text-slate-400">IN</span>
                                                        <span className="font-semibold text-slate-700">{formatTime(record.afternoon_in)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'afternoon_in')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'afternoon_in');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'afternoon_in')?.address} className="text-indigo-400 hover:text-indigo-600 transition-colors bg-indigo-50 p-1 rounded-md">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-xs font-bold text-slate-400">OUT</span>
                                                        <span className="font-semibold text-slate-700">{formatTime(record.afternoon_out)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'afternoon_out')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'afternoon_out');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'afternoon_out')?.address} className="text-indigo-400 hover:text-indigo-600 transition-colors bg-indigo-50 p-1 rounded-md">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-indigo-600 text-lg">{record.total_work_hours} hrs</span>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        {(record.late_minutes > 0 || record.undertime_minutes > 0) && (
                                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                                                                {record.late_minutes}m Late • {record.undertime_minutes}m UT
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-24 py-1.5 rounded-full text-xs font-bold border ${
                                                    record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' :
                                                    record.status === 'Half Day' ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' :
                                                    record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' :
                                                    record.status === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm' : 
                                                    'bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Pagination */}
                <div className="mt-6 flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <div className="text-sm font-semibold text-slate-500">
                        Showing <span className="text-slate-900">{attendances.from || 0}</span> to <span className="text-slate-900">{attendances.to || 0}</span> of <span className="text-slate-900">{attendances.total}</span> results
                    </div>
                </div>
            </div>
        </OfficeStaffLayout>
    );
}
