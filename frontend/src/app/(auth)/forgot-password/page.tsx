'use client';
import Link from 'next/link';
import {
    CheckCircleIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useForgotPasswordLogic } from '@/features/auth/hooks/useForgotPassword';

export default function ForgotPasswordPage() {
    const {
        token,
        email, setEmail,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        loading,
        errors, fieldErrorVisibility,
        error, message,
        isExitingError, isExitingMessage,
        handleRequestReset,
        handleResetPassword,
        dismissFieldError,
        getPasswordStrength,
        cooldown
    } = useForgotPasswordLogic();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
            <div className="glass w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 animate-slide-up-fade">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {token ? 'Reset Password' : 'Recover Account'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 text-center">
                        {token ? 'Set your new password' : 'Enter your email to reset password'}
                    </p>
                </div>

                {!token ? (
                    <form onSubmit={handleRequestReset} className="space-y-5" noValidate>
                        {/* email field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-blue-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && fieldErrorVisibility.email && (
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1 ml-1 animate-scale-in">
                                    <XCircleIcon className="w-3.5 h-3.5" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || cooldown > 0}
                            className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                        {/* new password field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-blue-500" />
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                            {errors.newPassword && fieldErrorVisibility.newPassword && (
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1 ml-1 animate-scale-in">
                                    <XCircleIcon className="w-3.5 h-3.5" />
                                    {errors.newPassword}
                                </p>
                            )}
                            {newPassword && (
                                <div className="flex items-center gap-2 mt-2 ml-1">
                                    <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${getPasswordStrength() === 'Strong' ? 'w-full bg-emerald-500' :
                                                getPasswordStrength() === 'Medium' ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-red-500'
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${getPasswordStrength() === 'Strong' ? 'text-emerald-500' :
                                        getPasswordStrength() === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {getPasswordStrength()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* confirm password field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-blue-500" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                                    disabled={loading}
                                />
                            </div>
                            {errors.confirmPassword && fieldErrorVisibility.confirmPassword && (
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1 ml-1 animate-scale-in">
                                    <XCircleIcon className="w-3.5 h-3.5" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </form>
                )}

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
                    Remembered? <Link href="/login" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-bold ml-1 text-base transition-colors duration-200">Log In</Link>
                </p>
            </div>
        </div>
    );
}