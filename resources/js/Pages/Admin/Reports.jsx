import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { router } from '@inertiajs/react';

// Icon components
const ChartBarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const DocumentTextIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1M13 16V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1M13 16H9M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);

const WrenchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UserGroupIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);

const FilterIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

export default function Reports({ authUser, deliveryStats, driverStats, truckStats, maintenanceStats, userStats, deliveryData, maintenanceData, url }) {
    const getInitialDateRange = () => {
        try {
            const currentUrl = url || window.location.href;
            const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
            return urlParams.get('dateRange') || 'today';
        } catch (error) {
            console.error('Error parsing URL:', error);
            return 'today';
        }
    };

    const [activeTab, setActiveTab] = useState('deliveries');
    const [dateRange, setDateRange] = useState(getInitialDateRange());
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        delivery: deliveryStats,
        driver: driverStats,
        truck: truckStats,
        maintenance: maintenanceStats,
        user: userStats
    });

    const [deliveryDataState, setDeliveryDataState] = useState(deliveryData || []);
    const [maintenanceDataState, setMaintenanceDataState] = useState(maintenanceData || []);
    const [showExportModal, setShowExportModal] = useState(false);

    const fetchFilteredData = async (range) => {
        setIsLoading(true);
        try {
            await router.get('/admin/reports', {
                dateRange: range,
                preserveState: false,
                preserveScroll: true,
                only: ['deliveryStats', 'driverStats', 'truckStats', 'maintenanceStats', 'userStats', 'deliveryData', 'maintenanceData'],
                onSuccess: (page) => {
                    setStats({
                        delivery: page.props.deliveryStats,
                        driver: page.props.driverStats,
                        truck: page.props.truckStats,
                        maintenance: page.props.maintenanceStats,
                        user: page.props.userStats
                    });
                    setDeliveryDataState(page.props.deliveryData || []);
                    setMaintenanceDataState(page.props.maintenanceData || []);
                    setDateRange(range);
                }
            });
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        fetchFilteredData(range);
    };

    const handleExport = () => {
        const data = activeTab === 'deliveries' ? deliveryDataState :
            activeTab === 'maintenance' ? maintenanceDataState :
                [];
        const hasData = activeTab === 'drivers' ? true : (data && data.length > 0);
        if (!hasData) return;
        setShowExportModal(true);
    };

    const performExport = () => {
        const data = activeTab === 'deliveries' ? deliveryDataState :
            activeTab === 'maintenance' ? maintenanceDataState :
                [];
        let csvContent = '';
        let filename = '';

        if (activeTab === 'deliveries') {
            csvContent = 'Waybill,Customer,Status,Pickup Address,Destination Address,Created At\n';
            csvContent += data.map(delivery =>
                `"${delivery.waybill || 'DEL-' + delivery.id}","${delivery.customer || ''}","${delivery.status || ''}","${delivery.pickup_address || ''}","${delivery.destination_address || ''}","${delivery.created_at || ''}"`
            ).join('\n');
            filename = `delivery_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'maintenance') {
            csvContent = 'Report ID,Vehicle Type,Issue Type,Parts Used,Status,Report Date\n';
            csvContent += data.map(maintenance =>
                `"${maintenance.report_id || ''}","${maintenance.vehicle_type || ''}","${maintenance.issue_title || ''}","${maintenance.parts_used || ''}","${maintenance.status || ''}","${maintenance.report_date || ''}"`
            ).join('\n');
            filename = `maintenance_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'drivers') {
            csvContent = 'Metric,Value\n';
            csvContent += `"Total Drivers","${driverStats.total || 0}"\n`;
            csvContent += `"Active Drivers","${driverStats.active || 0}"\n`;
            csvContent += `"Average Rating","${driverStats.averageRating || 0}"\n`;
            csvContent += `"Total Distance","${driverStats.totalDistance || 0}"\n`;
            filename = `driver_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportModal(false);
    };

    const tabs = [
        { id: 'deliveries', name: 'Deliveries', icon: TruckIcon },
        { id: 'maintenance', name: 'Maintenance', icon: WrenchIcon },
        { id: 'drivers', name: 'Drivers', icon: UserGroupIcon }
    ];

    const dateRanges = [
        { id: 'today', name: 'Today' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' }
    ];

    const renderDeliveryReports = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900">Delivery Details Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                {['Waybill', 'Customer', 'Status', 'Pickup', 'Destination', 'Date', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {deliveryDataState && deliveryDataState.length > 0 ? (
                                deliveryDataState.map((delivery) => (
                                    <tr key={delivery.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                                            {delivery.waybill || 'DEL-' + delivery.id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-800">
                                            {delivery.customer}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded-md ${delivery.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30' :
                                                    delivery.status === 'in_transit' ? 'bg-blue-50 text-blue-700 border border-blue-200/30' :
                                                        delivery.status === 'assigned' ? 'bg-amber-50 text-amber-700 border border-amber-200/30' :
                                                            'bg-slate-50 text-slate-600 border border-slate-200/30'
                                                }`}>
                                                {delivery.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 max-w-xs truncate">
                                            {delivery.pickup_address || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 max-w-xs truncate">
                                            {delivery.destination_address || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-medium">
                                            {delivery.created_at}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            <button className="text-[#10B981] hover:text-[#059669] font-bold">View</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-xs text-slate-400">
                                        No delivery records for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderMaintenanceReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Logs', value: stats.maintenance.total, icon: WrenchIcon, bg: 'bg-slate-900', iconColor: 'text-white' },
                    { label: 'Completed', value: stats.maintenance.completed, icon: ChartBarIcon, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'In Progress', value: stats.maintenance.in_progress, icon: CalendarIcon, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { label: 'Pending Request', value: stats.maintenance.pending, icon: ChartBarIcon, bg: 'bg-amber-50', iconColor: 'text-amber-600' }
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                                </div>
                                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900">Maintenance Request Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                {['Report ID', 'Unique ID', 'Vehicle Type', 'Issue Type', 'Parts Used', 'Status', 'Report Date', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {maintenanceDataState && maintenanceDataState.length > 0 ? (
                                maintenanceDataState.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                                            {m.report_id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 font-semibold">
                                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                {m.unique_id || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 font-semibold">
                                            {m.vehicle_type}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800">
                                            {m.issue_title}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 max-w-xs truncate">
                                            {m.parts_used}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-md ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30' :
                                                    m.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200/30' :
                                                        'bg-blue-50 text-blue-700 border border-blue-200/30'
                                                }`}>
                                                {m.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-medium">
                                            {m.report_date}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            <button className="text-[#10B981] hover:text-[#059669] font-bold">Details</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-xs text-slate-400">
                                        No maintenance logs for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderDriverReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Drivers', value: driverStats.total, icon: UserGroupIcon, bg: 'bg-slate-900', iconColor: 'text-white' },
                    { label: 'Active Roster', value: driverStats.active, icon: ChartBarIcon, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'Average Rating', value: driverStats.averageRating, icon: ChartBarIcon, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
                    { label: 'Total Distance', value: driverStats.totalDistance, icon: TruckIcon, bg: 'bg-blue-50', iconColor: 'text-blue-600' }
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                                </div>
                                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900">Operator Standings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                {['Driver ID', 'Name', 'License ID', 'Availability', 'Current Vehicle', 'Total Jobs', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">DRV-{String(item).padStart(4, '0')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-800">John Driver {item}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">DL-{2020 + item}-{1000 * item}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-md ${item <= 3 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30' :
                                                item === 4 ? 'bg-amber-50 text-amber-700 border border-amber-200/30' :
                                                    'bg-rose-50 text-rose-700 border border-rose-200/30'
                                            }`}>
                                            {item <= 3 ? 'Available' : item === 4 ? 'On Leave' : 'Busy'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 font-medium">
                                        {item <= 3 ? `TRK-${100 + item}` : item === 4 ? 'None' : 'TRK-105'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600 font-bold">{50 * item}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                                        <button className="text-[#10B981] hover:text-[#059669] font-bold">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'deliveries': return renderDeliveryReports();
            case 'maintenance': return renderMaintenanceReports();
            case 'drivers': return renderDriverReports();
            default: return renderDeliveryReports();
        }
    };

    return (
        <AdminLayout title="Operational Reports" authUser={authUser}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Operations Reports</h1>
                    <p className="text-slate-500 mt-0.5 text-sm">Review real-time metrics, generate logistics spreadsheets, and print dispatch audits</p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <select
                                value={dateRange}
                                onChange={(e) => handleDateRangeChange(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs hover:border-slate-300 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium text-slate-700"
                                disabled={isLoading}
                            >
                                {dateRanges.map(range => (
                                    <option key={range.id} value={range.id}>{range.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <FilterIcon className="w-3.5 h-3.5 text-slate-500" />
                                <span>Refine Options</span>
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                <span>Export Sheet</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/20">
                        <nav className="flex">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isCurrent = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all duration-200 ${isCurrent
                                                ? 'border-[#10B981] text-[#10B981] bg-emerald-50/10'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#10B981]"></div>
                        <span className="ml-2.5 text-xs font-bold text-slate-500">Retrieving operational data...</span>
                    </div>
                ) : (
                    renderContent()
                )}

                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-slate-100">
                            <div className="flex items-start">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                    <DownloadIcon className="w-5 h-5 text-[#10B981]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Download CSV Document</h3>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                        Are you sure you want to download the active {activeTab} sheet logs representing {dateRanges.find(r => r.id === dateRange)?.name || dateRange} stats?
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 mt-6">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performExport}
                                    className="px-4 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors"
                                >
                                    Confirm and Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
