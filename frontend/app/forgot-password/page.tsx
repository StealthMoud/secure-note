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
import { useForgotPasswordLogic } from './useForgotPasswordLogic';

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
        dismissFieldError
    } = useForgotPasswordLogic();

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 text-center w-full max-w-md mx-auto my-12">
            <h1 className="text-3xl font-bold tracking-wide text-gray-900 dark:text-gray-100 mt-4 mb-6 flex items-center justify-center">
                <LockClosedIcon className="h-8 w-8 mr-2 text-gray-400 dark:text-gray-500" />
                {token ? 'Reset Password' : 'Forgot Password'}
            </h1>

            {!token ? (
                <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
                    {/* Email Field */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="email-error"
                                disabled={loading}
                            />
                        </div>
                        {errors.email && (
                            <p
                                id="email-error"
                                className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.email ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}
                            >
                                {errors.email}
                                <button onClick={() => dismissFieldError('email')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-gray-900 dark:text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        Send Reset Link
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                    {/* New Password Field */}
                    <div className="space-y-1">
                        <label htmlFor="newPassword" className="sr-only">New Password</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full pl-10 pr-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="newPassword-error"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                disabled={loading}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p
                                id="newPassword-error"
                                className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.newPassword ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}
                            >
                                {errors.newPassword}
                                <button onClick={() => dismissFieldError('newPassword')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="w-full pl-10 pr-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="confirmPassword-error"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                disabled={loading}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p
                                id="confirmPassword-error"
                                className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.confirmPassword ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}
                            >
                                {errors.confirmPassword}
                                <button onClick={() => dismissFieldError('confirmPassword')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-gray-900 dark:text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        Reset Password
                    </button>
                </form>
            )}

            {error && (
                <p className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingError ? 'opacity-0' : 'opacity-100'}`}>
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                    {error}
                    <button onClick={() => dismissFieldError('error')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                    </button>
                </p>
            )}
            {message && (
                <p className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingMessage ? 'opacity-0' : 'opacity-100'}`}>
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200" />
                    {message}
                    <button onClick={() => dismissFieldError('message')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-green-800 dark:text-green-200" />
                    </button>
                </p>
            )}

            <p className="mt-4 text-sm text-gray-900 dark:text-gray-100">
                Back to{' '}
                <Link href="/login" className="text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200">
                    Login
                </Link>
            </p>
        </div>
    );
}