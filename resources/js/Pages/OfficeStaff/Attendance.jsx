import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import { Search, Download, Calendar, MapPin, Clock, FileSpreadsheet, XCircle, User } from 'lucide-react';
import Pagination from '@/Components/Pagination';

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
        <OfficeStaffLayout activeMenu="attendance" title="Attendance Management">
            <Head title="Attendance Management" />

            <div className="max-w-7xl pb-12">
                <div className="flex justify-end gap-3 mb-6">
                    <button className="px-4 py-2 bg-white border border-black text-black hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors flex items-center gap-2 font-medium text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-[2px] hover:translate-x-[2px]">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button className="px-4 py-2 bg-white border border-black text-black hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors flex items-center gap-2 font-medium text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-[2px] hover:translate-x-[2px]">
                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                    </button>
                </div>

                <div className="bg-white border border-zinc-300 shadow-sm mb-6 p-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4 text-zinc-400" /> Search
                            </label>
                            <input 
                                className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors placeholder:text-zinc-400"
                                type="text" 
                                placeholder="Employee Name or ID..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-56">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-400" /> Date
                            </label>
                            <input 
                                className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors"
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-zinc-400" /> Status
                            </label>
                            <select 
                                className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors text-zinc-900"
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
                            <button type="submit" className="flex-1 md:flex-none px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm border border-transparent">
                                <Search className="w-4 h-4" /> Filter
                            </button>
                            <button type="button" onClick={clearFilters} className="px-4 py-2 text-black border border-black bg-white hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-zinc-300 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date & Employee</th>
                                    <th className="px-6 py-4">Morning Shift</th>
                                    <th className="px-6 py-4">Afternoon Shift</th>
                                    <th className="px-6 py-4">Work Hours</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {attendances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-400">
                                                <Calendar className="w-12 h-12 mb-4 opacity-20" strokeWidth={1} />
                                                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">No attendance records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-zinc-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-zinc-900">
                                                    {record.user ? `${record.user.firstname || ''} ${record.user.lastname || ''}`.trim() || record.user.username : 'Unknown User'}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">
                                                    {new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            
                                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-[10px] font-bold text-zinc-400 tracking-widest">IN</span>
                                                        <span className="font-medium text-zinc-800">{formatTime(record.morning_in)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'morning_in')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'morning_in');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'morning_in')?.address} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-[10px] font-bold text-zinc-400 tracking-widest">OUT</span>
                                                        <span className="font-medium text-zinc-800">{formatTime(record.morning_out)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'morning_out')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'morning_out');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'morning_out')?.address} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-[10px] font-bold text-zinc-400 tracking-widest">IN</span>
                                                        <span className="font-medium text-zinc-800">{formatTime(record.afternoon_in)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'afternoon_in')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'afternoon_in');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'afternoon_in')?.address} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 text-[10px] font-bold text-zinc-400 tracking-widest">OUT</span>
                                                        <span className="font-medium text-zinc-800">{formatTime(record.afternoon_out)}</span>
                                                        {record.logs?.find(l => l.attendance_type === 'afternoon_out')?.latitude && (
                                                            <button onClick={() => {
                                                                const log = record.logs.find(l => l.attendance_type === 'afternoon_out');
                                                                openMap(log.latitude, log.longitude);
                                                            }} title={record.logs.find(l => l.attendance_type === 'afternoon_out')?.address} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-zinc-900">{record.total_work_hours} hrs</span>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        {(record.late_minutes > 0 || record.undertime_minutes > 0) && (
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                                                {record.late_minutes}m Late • {record.undertime_minutes}m UT
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] uppercase tracking-widest font-bold border ${
                                                    record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    record.status === 'Half Day' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                    'bg-zinc-50 text-zinc-700 border-zinc-200'
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
                <div className="mt-4 bg-white border border-zinc-200">
                    <Pagination
                        currentPage={attendances.current_page || 1}
                        totalPages={attendances.last_page || 1}
                        onPageChange={(p) => router.get('/office-staff/attendance', { page: p, search, date, status }, { preserveState: true, preserveScroll: true })}
                        totalItems={attendances.total || 0}
                        itemsPerPage={attendances.per_page || 10}
                    />
                </div>
            </div>
        </OfficeStaffLayout>
    );
}
