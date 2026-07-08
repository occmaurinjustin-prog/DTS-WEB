import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import { Calculator, Calendar, DollarSign, User, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

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
        <OfficeStaffLayout>
            <Head title="Payroll Management" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Payroll Management</h1>
                    <p className="text-slate-500 font-medium text-lg">Generate and track mechanic salary calculations</p>
                </div>

                {/* Notifications */}
                {flash?.success && (
                    <div className="mb-8 p-4 rounded-2xl bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 text-emerald-700 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <p className="font-semibold">{flash.success}</p>
                    </div>
                )}
                
                {Object.keys(errors).length > 0 && (
                    <div className="mb-8 p-4 rounded-2xl bg-rose-50/50 backdrop-blur-xl border border-rose-200/50 text-rose-700 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            {Object.values(errors).map((err, i) => (
                                <p key={i} className="font-semibold">{err}</p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Generate Form */}
                    <div className="xl:col-span-1 h-fit">
                        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Calculate Salary</h2>
                                </div>
                            </div>
                            
                            <form onSubmit={handleGenerate} className="p-6 space-y-5">
                                <div className="flex items-center gap-2 mb-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                    <input 
                                        type="checkbox" 
                                        id="generateAll"
                                        checked={generateAll}
                                        onChange={(e) => {
                                            setGenerateAll(e.target.checked);
                                            if (e.target.checked) setUserId('');
                                        }}
                                        className="w-4 h-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="generateAll" className="text-sm font-bold text-indigo-900 cursor-pointer">
                                        Generate for ALL mechanics
                                    </label>
                                </div>
                                
                                {!generateAll && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" /> Mechanic
                                        </label>
                                        <select 
                                            required={!generateAll}
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
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
                                        <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" /> Start Date
                                        </label>
                                        <input 
                                            required
                                            type="date" 
                                            value={periodStart}
                                            onChange={(e) => setPeriodStart(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" /> End Date
                                        </label>
                                        <input 
                                            required
                                            type="date" 
                                            value={periodEnd}
                                            onChange={(e) => setPeriodEnd(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-slate-400" /> Hourly Rate (₱)
                                    </label>
                                    <input 
                                        required
                                        type="number" 
                                        step="0.01"
                                        min="62.50"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isGenerating}
                                        className={`w-full py-3.5 text-white rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg ${
                                            isGenerating 
                                                ? 'bg-slate-400 shadow-none cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Calculator className="w-5 h-5" />
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
                        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Recent Payrolls</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <input 
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 text-slate-600 shadow-sm"
                                        title="Filter by Period Date"
                                    />
                                    {filterDate && (
                                        <button onClick={() => setFilterDate('')} className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-1">
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Employee & Period</th>
                                            <th className="px-6 py-4">Hours & Rate</th>
                                            <th className="px-6 py-4 text-rose-500">Deductions</th>
                                            <th className="px-6 py-4">Net Salary</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPayrolls.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <FileText className="w-12 h-12 mb-3 opacity-20" strokeWidth={1} />
                                                        <p className="text-base font-medium">No payroll records found</p>
                                                        {filterDate ? (
                                                            <p className="text-sm mt-1">No records cover the date {filterDate}.</p>
                                                        ) : (
                                                            <p className="text-sm mt-1">Use the form to calculate a mechanic's salary.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPayrolls.map((record) => (
                                                <tr key={record.payroll_id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">
                                                            {record.user ? `${record.user.firstname || ''} ${record.user.lastname || ''}`.trim() : 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {record.period_start} to {record.period_end}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-700">{record.total_hours} hrs</div>
                                                        <div className="text-xs text-slate-500 mt-1">@ ₱{record.hourly_rate}/hr</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-rose-600 font-bold">
                                                        {record.deductions > 0 ? `- ₱${record.deductions}` : '₱0.00'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-lg font-black text-indigo-600">
                                                            ₱{record.net_salary}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                                record.status === 'paid' 
                                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                            }`}>
                                                                {record.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                                {record.status === 'paid' ? 'Paid' : 'Pending'}
                                                            </span>

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </OfficeStaffLayout>
    );
}
