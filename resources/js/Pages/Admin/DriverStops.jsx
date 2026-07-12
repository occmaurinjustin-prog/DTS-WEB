import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function DriverStops({ authUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterDate, setFilterDate] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second for live duration tracking
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch Stops function
    const fetchStops = async ({ queryKey }) => {
        const [_key, page, search, date] = queryKey;
        const response = await axios.get(`/api/admin/driver-stops`, {
            params: {
                page: page,
                search: search,
                date: date
            }
        });
        return response.data;
    };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['driver-stops', currentPage, debouncedSearch, filterDate],
        queryFn: fetchStops,
        placeholderData: (previousData) => previousData,
    });

    const parseLocalDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const formatDuration = (minutes) => {
        if (!minutes && minutes !== 0) return 'Ongoing';
        const mins = Math.round(minutes);
        if (mins === 0) return '< 1m';
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const formatLiveDuration = (stoppedAt) => {
        if (!stoppedAt) return 'Ongoing';
        const stopDate = parseLocalDate(stoppedAt);
        const diffMs = Math.max(0, currentTime.getTime() - stopDate.getTime());
        const totalSeconds = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const formatCompletedDuration = (stoppedAt, resumedAt, fallbackMinutes) => {
        if (!stoppedAt || !resumedAt) return formatDuration(fallbackMinutes);
        const stopDate = parseLocalDate(stoppedAt);
        const resumeDate = parseLocalDate(resumedAt);
        const diffMs = Math.max(0, resumeDate.getTime() - stopDate.getTime());
        const totalSeconds = Math.floor(diffMs / 1000);
        
        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        }
        
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Ongoing';
        const date = parseLocalDate(dateString);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const openGoogleMaps = (lat, lng) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    return (
        <AdminLayout user={authUser}>
            <Head title="Driver Stop History" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm font-medium text-slate-500 mb-1">Total Stops (Today)</div>
                        <div className="text-2xl font-bold text-slate-900">{data?.stats?.totalToday || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm font-medium text-slate-500 mb-1">Total Stops (This Week)</div>
                        <div className="text-2xl font-bold text-slate-900">{data?.stats?.totalWeek || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm font-medium text-slate-500 mb-1">Average Stop Duration</div>
                        <div className="text-2xl font-bold text-slate-900">{formatDuration(data?.stats?.avgDuration)}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm font-medium text-slate-500 mb-1">Most Stops (Driver)</div>
                        <div className="text-xl font-bold text-slate-900 truncate">{data?.stats?.mostStopsDriver || 'N/A'}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-t-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="w-full sm:w-96 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search driver or waybill..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <input
                            type="date"
                            className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-600"
                            onChange={(e) => {
                                setFilterDate(e.target.value || 'all');
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-hidden relative">
                    {isFetching && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Truck</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timing</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                            Loading stops...
                                        </td>
                                    </tr>
                                ) : data?.data?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-base font-medium text-slate-900">No stops found</p>
                                                <p className="text-sm">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data?.data?.data?.map((stop) => (
                                        <tr key={stop.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                        {stop.driver?.user?.firstname?.[0] || 'D'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {stop.driver?.user?.firstname} {stop.driver?.user?.lastname}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{stop.driver?.license_number}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {stop.driver?.truck?.plate_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {stop.delivery ? (
                                                    <div>
                                                        <span className="font-medium text-slate-900">#{stop.delivery.waybill}</span>
                                                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{stop.delivery.client?.client_name}</div>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900"><span className="text-red-500 mr-1">●</span>{formatDate(stop.stopped_at)}</div>
                                                <div className="text-sm text-slate-500 mt-1"><span className="text-emerald-500 mr-1">▶</span>{formatDate(stop.resumed_at)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stop.resumed_at ? 'bg-slate-100 text-slate-800' : 'bg-red-100 text-red-800 font-bold shadow-sm ring-1 ring-red-200'
                                                    }`}>
                                                    {stop.resumed_at && stop.duration_minutes !== null ? (
                                                        formatCompletedDuration(stop.stopped_at, stop.resumed_at, stop.duration_minutes)
                                                    ) : (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                            </span>
                                                            {formatLiveDuration(stop.stopped_at)}
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openGoogleMaps(stop.latitude, stop.longitude)}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Map
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data?.data?.last_page > 1 && (
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium text-slate-900">{data.data.from || 0}</span> to <span className="font-medium text-slate-900">{data.data.to || 0}</span> of <span className="font-medium text-slate-900">{data.data.total}</span> stops
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-700 font-medium px-2">
                                    Page {currentPage} of {data.data.last_page}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(data.data.last_page, p + 1))}
                                    disabled={currentPage === data.data.last_page}
                                    className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
