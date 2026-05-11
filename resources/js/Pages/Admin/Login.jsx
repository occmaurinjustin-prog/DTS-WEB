import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Admin Login" />
            
            {/* Global Styles for Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(20px) rotate(-3deg); }
                }
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes wave {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    50% { transform: translateX(-10px) translateY(5px); }
                }
                @keyframes truck-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
                .animate-slide-left { animation: slide-in-left 0.6s ease-out forwards; }
                .animate-slide-right { animation: slide-in-right 0.6s ease-out forwards; }
                .animate-fade-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-pulse-soft { animation: pulse-soft 4s ease-in-out infinite; }
                .animate-wave { animation: wave 5s ease-in-out infinite; }
                .animate-truck { animation: truck-bounce 2s ease-in-out infinite; }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-400 { animation-delay: 400ms; }
                .delay-500 { animation-delay: 500ms; }
                .delay-600 { animation-delay: 600ms; }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
            `}</style>

            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
                
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/images/DTS-TRUCK.png')",
                            filter: 'brightness(0.4)',
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-red-950/50"></div>
                </div>
                
                {/* Main Content Container */}
                <div className={`relative z-10 w-full max-w-4xl mx-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    
                    {/* Premium Gradient Border Container */}
                    <div 
                        className={`relative p-[3px] rounded-[20px] bg-gradient-to-br from-red-600 via-red-500 to-red-700 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 ${isLoaded ? 'animate-fade-up' : ''}`}
                        style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 25%, #b91c1c 50%, #ef4444 75%, #dc2626 100%)',
                            backgroundSize: '300% 300%',
                        }}
                    >
                        {/* Animated Gradient Border */}
                        <div 
                            className="absolute inset-0 rounded-[20px] animate-gradient opacity-80"
                            style={{
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 25%, #b91c1c 50%, #ef4444 75%, #dc2626 100%)',
                                backgroundSize: '300% 300%',
                            }}
                        ></div>
                        
                        {/* Glassmorphism Inner Container - Slate Theme */}
                        <div className={`relative bg-slate-800/95 backdrop-blur-xl rounded-[17px] overflow-hidden flex flex-col md:flex-row shadow-inner ${isLoaded ? 'animate-scale-in' : ''}`}>
                        
                        {/* LEFT SIDE - Full Bleed Image Edge-to-Edge */}
                        <div className={`relative md:w-1/2 overflow-hidden ${isLoaded ? 'animate-slide-left' : ''}`}>
                            {/* Full Bleed Background Image */}
                            <img 
                                src="/images/DTS-TRUCK.png" 
                                alt="DTS Logistics" 
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = '/images/dtstruck.jpg';
                                }}
                            />
                            {/* Optional subtle overlay for depth */}
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                        
                        {/* RIGHT SIDE - Login Form - White Background */}
                        <div className={`md:w-1/2 bg-white p-8 md:p-10 ${isLoaded ? 'animate-slide-right delay-200' : ''}`}>
                            
                            {/* Form Header */}
                            <div className={`mb-6 ${isLoaded ? 'animate-fade-up delay-300' : ''}`}>
                                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                                <p className="text-gray-500 text-sm mt-1">Sign in to your admin account</p>
                            </div>
                            
                            {/* Login Form */}
                            <form className="space-y-4" onSubmit={submit}>
                                
                                {/* Username Input */}
                                <div className={`${isLoaded ? 'animate-fade-up delay-400' : ''}`}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'username' ? 'text-gray-600' : 'text-gray-400'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all duration-200 outline-none"
                                            placeholder="Enter your username"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Password Input */}
                                <div className={`${isLoaded ? 'animate-fade-up delay-500' : ''}`}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-gray-600' : 'text-gray-400'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all duration-200 outline-none"
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me and Forgot Password */}
                                <div className={`flex items-center justify-between ${isLoaded ? 'animate-fade-up delay-600' : ''}`}>
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 cursor-pointer"
                                        />
                                        <label 
                                            htmlFor="remember-me" 
                                            className="ml-2 text-xs text-gray-500 cursor-pointer"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#" className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>

                                {/* Error Message */}
                                {errors.username && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-red-600">{errors.username}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Login Button - Deep Gray */}
                                <div className={`pt-2 ${isLoaded ? 'animate-fade-up delay-600' : ''}`}>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/25 hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                        
                                        {processing ? (
                                            <div className="flex items-center relative z-10">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center relative z-10">
                                                <span>Sign In</span>
                                                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Footer */}
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    © 2026 Delivery Tracking System. All rights reserved.
                                </p>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
