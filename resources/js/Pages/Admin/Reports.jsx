import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Icon components
const ChartBarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

const PdfIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export default function Reports({ authUser, deliveryStats, driverStats, truckStats, maintenanceStats, userStats, deliveryData, maintenanceData, url }) {
    const getInitialDateRange = () => {
        try {
            const currentUrl = url || window.location.href;
            const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
            return urlParams.get('dateRange') || 'today';
        } catch (error) {
            return 'today';
        }
    };

    const [activeTab, setActiveTab] = useState('deliveries');
    const [dateRange, setDateRange] = useState(getInitialDateRange());
    const [isLoading, setIsLoading] = useState(false);
    
    // We update stats locally if we refetch, otherwise we use props
    const [stats, setStats] = useState({
        delivery: deliveryStats || {},
        driver: driverStats || {},
        truck: truckStats || {},
        maintenance: maintenanceStats || {},
        user: userStats || {}
    });

    const [deliveryDataState, setDeliveryDataState] = useState(deliveryData || []);
    const [maintenanceDataState, setMaintenanceDataState] = useState(maintenanceData || []);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');

    const fetchFilteredData = async (range) => {
        setIsLoading(true);
        try {
            router.get('/admin/reports', { dateRange: range }, {
                preserveState: true,
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
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setIsLoading(false);
        }
    };

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        fetchFilteredData(range);
    };

    const handleExport = (format) => {
        setExportFormat(format);
        setShowExportModal(true);
    };

    const performExport = () => {
        if (exportFormat === 'csv') {
            generateCSV();
        } else {
            generatePDF();
        }
        setShowExportModal(false);
    };

    const generateCSV = () => {
        const data = activeTab === 'deliveries' ? deliveryDataState :
            activeTab === 'maintenance' ? maintenanceDataState : [];
        let csvContent = '';
        let filename = '';

        if (activeTab === 'deliveries') {
            csvContent = 'Waybill,Customer,Pickup Address,Destination Address,Created At\n';
            csvContent += data.map(delivery =>
                `"${delivery.waybill || 'DEL-' + delivery.id}","${delivery.customer || ''}","${delivery.pickup_address || ''}","${delivery.destination_address || ''}","${delivery.created_at || ''}"`
            ).join('\n');
            filename = `delivery_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'maintenance') {
            csvContent = 'Report ID,Vehicle Type,Issue Type,Parts Used,Report Date\n';
            csvContent += data.map(m =>
                `"${m.report_id || ''}","${m.vehicle_type || ''}","${m.issue_title || ''}","${m.parts_used || ''}","${m.report_date || ''}"`
            ).join('\n');
            filename = `maintenance_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'drivers') {
            csvContent = 'Metric,Value\n';
            csvContent += `"Total Drivers","${stats.driver.total || 0}"\n`;
            csvContent += `"Active Drivers","${stats.driver.active || 0}"\n`;
            csvContent += `"On Leave","${stats.driver.on_leave || 0}"\n`;
            csvContent += `"Busy","${stats.driver.busy || 0}"\n`;
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
    };

    const generatePDF = () => {
        const doc = new jsPDF(activeTab === 'deliveries' ? 'landscape' : 'portrait');
        const reportTitle = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`;
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text("DTS Logistics Reports", 14, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(reportTitle, 14, 30);
        doc.text(`Period: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, 14, 36);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);
        
        if (activeTab === 'deliveries') {
            const tableColumn = ["Waybill", "Customer", "Driver", "Pickup", "Destination", "Date"];
            const tableRows = deliveryDataState.map(d => [
                d.waybill || 'DEL-' + d.id,
                d.customer || 'Unknown',
                d.driver || 'Unassigned',
                d.pickup_address || 'N/A',
                d.destination_address || 'N/A',
                d.created_at || 'N/A'
            ]);

            autoTable(doc, {
                startY: 50,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                styles: { fontSize: 8 },
            });
        } else if (activeTab === 'maintenance') {
            const tableColumn = ["Report ID", "Plate Number", "Vehicle Type", "Issue", "Date"];
            const tableRows = maintenanceDataState.map(m => [
                m.report_id || 'N/A',
                m.truck_plate || 'Unknown',
                m.vehicle_type || 'Unknown',
                m.issue_title || 'N/A',
                m.report_date || 'N/A'
            ]);

            autoTable(doc, {
                startY: 50,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
            });
        } else if (activeTab === 'drivers') {
            const tableColumn = ["Metric", "Value"];
            const tableRows = [
                ["Total Drivers", stats.driver.total || "0"],
                ["Active Drivers", stats.driver.active || "0"],
                ["On Leave", stats.driver.on_leave || "0"],
                ["Busy", stats.driver.busy || "0"]
            ];

            autoTable(doc, {
                startY: 50,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
            });
        }

        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {align: 'center'});
        }

        doc.save(`${activeTab}_report_${dateRange}_${new Date().toISOString().split('T')[0]}.pdf`);
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Deliveries', value: stats.delivery?.total || 0, icon: TruckIcon, bg: 'bg-slate-900', iconColor: 'text-white' },
                    { label: 'Completed', value: stats.delivery?.completed || 0, icon: ChartBarIcon, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'In Transit', value: stats.delivery?.in_transit || 0, icon: TruckIcon, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { label: 'Pending', value: stats.delivery?.pending || 0, icon: ChartBarIcon, bg: 'bg-amber-50', iconColor: 'text-amber-600' }
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
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
                    <h3 className="text-sm font-bold text-slate-900">Delivery Details Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                {['Waybill', 'Customer', 'Driver', 'Pickup', 'Destination', 'Date'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {deliveryDataState.length > 0 ? (
                                deliveryDataState.map((delivery) => (
                                    <tr key={delivery.id} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                                            {delivery.waybill || 'DEL-' + delivery.id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-800">
                                            {delivery.customer}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700">
                                            {delivery.driver}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700 max-w-[150px] truncate" title={delivery.pickup_address}>
                                            {delivery.pickup_address || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700 max-w-[150px] truncate" title={delivery.destination_address}>
                                            {delivery.destination_address || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                            {delivery.created_at}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-xs text-slate-400">
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
                    { label: 'Total Logs', value: stats.maintenance?.total || 0, icon: WrenchIcon, bg: 'bg-slate-900', iconColor: 'text-white' },
                    { label: 'Completed', value: stats.maintenance?.completed || 0, icon: ChartBarIcon, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'In Progress', value: stats.maintenance?.in_progress || 0, icon: CalendarIcon, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { label: 'Pending', value: stats.maintenance?.pending || 0, icon: ChartBarIcon, bg: 'bg-amber-50', iconColor: 'text-amber-600' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                            </div>
                            <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900">Maintenance Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                {['Report ID', 'Plate', 'Vehicle Type', 'Issue', 'Date'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {maintenanceDataState.length > 0 ? (
                                maintenanceDataState.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                                            {m.report_id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 font-mono">
                                            {m.truck_plate}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800">
                                            {m.vehicle_type}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800">
                                            {m.issue_title}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                            {m.report_date}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-xs text-slate-400">
                                        No maintenance logs found
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
                    { label: 'Total Drivers', value: stats.driver?.total || 0, icon: UserGroupIcon, bg: 'bg-slate-900', iconColor: 'text-white' },
                    { label: 'Active', value: stats.driver?.active || 0, icon: ChartBarIcon, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'Busy / Transit', value: (stats.driver?.busy || 0) + (stats.driver?.in_transit || 0), icon: TruckIcon, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { label: 'On Leave', value: stats.driver?.on_leave || 0, icon: CalendarIcon, bg: 'bg-amber-50', iconColor: 'text-amber-600' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                            </div>
                            <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-10 flex flex-col items-center justify-center text-center">
                    <UserGroupIcon className="w-16 h-16 text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Driver Performance Data</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md">Driver specific tabular data is aggregated in the export files. Click Generate PDF above to download the full roster report.</p>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Operational Reports" authUser={authUser}>
            <div className="space-y-6">


                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <select
                                value={dateRange}
                                onChange={(e) => handleDateRangeChange(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#10B981] transition-colors"
                                disabled={isLoading}
                            >
                                {dateRanges.map(range => (
                                    <option key={range.id} value={range.id}>{range.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleExport('csv')}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                <span>Export CSV</span>
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/10 transition-all"
                            >
                                <PdfIcon className="w-3.5 h-3.5" />
                                <span>Generate PDF</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/20">
                        <nav className="flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all ${
                                        activeTab === tab.id
                                            ? 'border-[#10B981] text-[#10B981] bg-emerald-50/10'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#10B981]"></div>
                        <span className="ml-2.5 text-xs font-bold text-slate-500">Loading data...</span>
                    </div>
                ) : (
                    activeTab === 'deliveries' ? renderDeliveryReports() :
                    activeTab === 'maintenance' ? renderMaintenanceReports() :
                    renderDriverReports()
                )}

                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-slate-100">
                            <div className="flex items-start">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${exportFormat === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-[#10B981]'}`}>
                                    {exportFormat === 'pdf' ? <PdfIcon className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Generate {exportFormat.toUpperCase()} Document</h3>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                        Are you sure you want to generate a {exportFormat.toUpperCase()} report for {activeTab} ({dateRanges.find(r => r.id === dateRange)?.name})?
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
                                    className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors ${exportFormat === 'pdf' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#10B981] hover:bg-[#059669]'}`}
                                >
                                    Generate {exportFormat.toUpperCase()}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
