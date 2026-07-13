import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import { Calculator, Calendar, DollarSign, User, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import usePagination from '@/hooks/usePagination';

export default function Payroll({ payrolls, mechanics }) {
    const { errors, flash } = usePage().props;
    
    // Generate Payroll Form State
    const [userId, setUserId] = useState('');
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [hourlyRate, setHourlyRate] = useState('62.50');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateAll, setGenerateAll] = useState(false);
    

    // Filter State
    const [filterDate, setFilterDate] = useState('');

    const filteredPayrolls = payrolls.filter(record => {
        if (!filterDate) return true;
        return filterDate >= record.period_start && filterDate <= record.period_end;
    });

    const { paginatedData, currentPage, setCurrentPage, totalPages } = usePagination(filteredPayrolls, 10);

    const handleGenerate = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        
        const url = generateAll ? '/office-staff/payroll/generate-all' : '/office-staff/payroll/generate';
        const payload = generateAll ? {
            period_start: periodStart,
            period_end: periodEnd,
            hourly_rate: hourlyRate
        } : {
            user_id: userId,
            period_start: periodStart,
            period_end: periodEnd,
            hourly_rate: hourlyRate
        };

        router.post(url, payload, {
            preserveState: true,
            onFinish: () => setIsGenerating(false),
            onSuccess: () => {
                setUserId('');
                setPeriodStart('');
                setPeriodEnd('');
                setGenerateAll(false);
            }
        });
    };

    return (
        <OfficeStaffLayout title="Payroll Management" activeMenu="payroll">
            <Head title="Payroll Management" />

            <div className="max-w-7xl pb-12">
                {/* Notifications */}
                {flash?.success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}
                
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            {Object.values(errors).map((err, i) => (
                                <p key={i} className="text-sm font-medium">{err}</p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Generate Form */}
                    <div className="xl:col-span-1 h-fit">
                        <div className="bg-white border border-zinc-200 sticky top-6">
                            <div className="p-4 border-b border-zinc-200">
                                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                    <Calculator className="w-4 h-4" /> Calculate Salary
                                </h2>
                            </div>
                            
                            <form onSubmit={handleGenerate} className="p-4 space-y-4">
                                <div className="flex items-center gap-2 mb-2 p-3 bg-zinc-50 border border-zinc-200">
                                    <input 
                                        type="checkbox" 
                                        id="generateAll"
                                        checked={generateAll}
                                        onChange={(e) => {
                                            setGenerateAll(e.target.checked);
                                            if (e.target.checked) setUserId('');
                                        }}
                                        className="w-4 h-4 text-zinc-900 border-zinc-300 focus:ring-0"
                                    />
                                    <label htmlFor="generateAll" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide cursor-pointer">
                                        Generate for ALL mechanics
                                    </label>
                                </div>
                                
                                {!generateAll && (
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-zinc-400" /> Mechanic
                                        </label>
                                        <select 
                                            required={!generateAll}
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors"
                                        >
                                            <option value="" disabled>Select a mechanic</option>
                                            {mechanics.map((mechanic) => (
                                                <option key={mechanic.user_id} value={mechanic.user_id}>
                                                    {mechanic.firstname} {mechanic.lastname}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-400" /> Start Date
                                        </label>
                                        <input 
                                            required
                                            type="date" 
                                            value={periodStart}
                                            onChange={(e) => setPeriodStart(e.target.value)}
                                            className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-400" /> End Date
                                        </label>
                                        <input 
                                            required
                                            type="date" 
                                            value={periodEnd}
                                            onChange={(e) => setPeriodEnd(e.target.value)}
                                            className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-zinc-400" /> Hourly Rate (₱)
                                    </label>
                                    <input 
                                        required
                                        type="number" 
                                        step="0.01"
                                        min="62.50"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(e.target.value)}
                                        className="w-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors"
                                    />
                                </div>
                                
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isGenerating}
                                        className={`w-full py-3 text-white transition-colors font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                                            isGenerating 
                                                ? 'bg-zinc-400 cursor-not-allowed' 
                                                : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Calculator className="w-4 h-4" />
                                                Generate Payroll
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Generated Payrolls List */}
                    <div className="xl:col-span-2">
                        <div className="bg-white border border-zinc-200 overflow-hidden">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-zinc-500" /> Recent Payrolls
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium focus:ring-0 focus:border-zinc-500 text-zinc-600 transition-colors"
                                        title="Filter by Period Date"
                                    />
                                    {filterDate && (
                                        <button onClick={() => setFilterDate('')} className="text-xs text-red-500 hover:text-red-700 font-bold ml-1 uppercase tracking-wider">
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Employee & Period</th>
                                            <th className="px-4 py-3">Hours & Rate</th>
                                            <th className="px-4 py-3">Gross Salary</th>
                                            <th className="px-4 py-3 text-red-400">Deductions</th>
                                            <th className="px-4 py-3">Net Salary</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredPayrolls.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-zinc-400">
                                                        <FileText className="w-8 h-8 mb-3 opacity-20" />
                                                        <p className="text-xs uppercase tracking-widest font-semibold">No payroll records found</p>
                                                        {filterDate ? (
                                                            <p className="text-xs mt-1">No records cover the date {filterDate}.</p>
                                                        ) : (
                                                            <p className="text-xs mt-1">Use the form to calculate a mechanic's salary.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((record) => {
                                                const regularHours = record.details?.find(d => d.category === 'regular_hours');
                                                const deductionsAmount = record.details?.filter(d => d.type === 'deductions').reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0;

                                                return (
                                                <tr key={record.payroll_id} className="hover:bg-zinc-50 transition-colors group">
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-zinc-900">
                                                            {record.user ? `${record.user.firstname || ''} ${record.user.lastname || ''}`.trim() : 'Unknown'}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 uppercase tracking-wide">
                                                            <Calendar className="w-3 h-3" />
                                                            {record.period_start} to {record.period_end}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-zinc-700">{regularHours?.hours || 0} hrs</div>
                                                        <div className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest">@ ₱{regularHours?.rate || 0}/hr</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-zinc-700">
                                                            ₱{record.gross_salary}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-red-600 font-semibold">
                                                        {deductionsAmount > 0 ? `- ₱${deductionsAmount.toFixed(2)}` : '₱0.00'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-bold text-zinc-900">
                                                            ₱{record.net_salary}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold border ${
                                                                record.status === 'paid' 
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                                {record.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                                {record.status === 'paid' ? 'Paid' : 'Pending'}
                                                            </span>

                                                        </div>
                                                    </td>
                                                </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {filteredPayrolls.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filteredPayrolls.length}
                                    itemsPerPage={10}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </OfficeStaffLayout>
    );
}
