'use client';
import Link from 'next/link';
import {
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    KeyIcon,
    LockClosedIcon,
    UserIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useLoginLogic } from '@/features/auth/hooks/useLogin';

export default function LoginPage() {
    const {
        identifier,
        setIdentifier,
        password,
        setPassword,
        totpCode,
        setTotpCode,
        rememberMe,
        setRememberMe,
        showPassword,
        setShowPassword,
        loading,
        requires2FA,
        errors,
        fieldErrorVisibility,
        error,
        message,
        isExitingError,
        isExitingMessage,
        handleLogin,
        handleOAuthLogin,
        dismissFieldError,
    } = useLoginLogic();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
            <div className="glass w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 animate-slide-up-fade">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                        <KeyIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                    {/* account identifier */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email or Username</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-blue-500" />
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Email or Username"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                                disabled={loading}
                            />
                        </div>
                        {errors.identifier && fieldErrorVisibility.identifier && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1 ml-1 animate-scale-in">
                                <XCircleIcon className="w-3.5 h-3.5" />
                                {errors.identifier}
                            </p>
                        )}
                    </div>

                    {/* access password */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-blue-500" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && fieldErrorVisibility.password && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1 ml-1 animate-scale-in">
                                <XCircleIcon className="w-3.5 h-3.5" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* dual factor authorization */}
                    {requires2FA && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">2FA Security Token</label>
                            <div className="relative group">
                                <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                <input
                                    id="totpCode"
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value)}
                                    placeholder="000000"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black tracking-widest text-center"
                                    disabled={loading}
                                />
                            </div>
                            {errors.totpCode && fieldErrorVisibility.totpCode && (
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1 ml-1 animate-scale-in">
                                    <XCircleIcon className="w-3.5 h-3.5" />
                                    {errors.totpCode}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer"
                                disabled={loading}
                            />
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors uppercase tracking-widest">Remember</span>
                        </label>
                        <Link href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                            Lost Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : (requires2FA ? 'Verify 2FA' : 'Sign In')}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em] bg-transparent">
                        <span className="px-3 text-gray-400 dark:text-gray-500">Or Continue With</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-blue-600 hover:text-white transition-all group"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-8.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
                    </button>
                    <button
                        onClick={() => handleOAuthLogin('github')}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-gray-900 hover:text-white transition-all group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.84 9.5.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-.58-1.12-.88-1.12-.88-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.564 9.564 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4 .1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.135 20.17 22 16.42 22 12c0-5.523-4.477-10-10-10z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">GitHub</span>
                    </button>
                </div>

                {/* alert messages */}
                {(error || message) && (
                    <div className="mt-8 animate-scale-in">
                        {error && (
                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-3">
                                <XCircleIcon className="w-5 h-5" />
                                <span className="flex-1">{error}</span>
                            </div>
                        )}
                        {message && (
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="flex-1">{message}</span>
                            </div>
                        )}
                    </div>
                )}

                <p className="mt-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Don't have an account? <Link href="/register" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-bold ml-1 text-base transition-colors duration-200">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}