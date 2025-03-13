'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { requestPasswordReset, resetPassword } from '@/services/auth';
import Link from 'next/link';
import {
    CheckCircleIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [email, setEmail] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    // Validation for request reset form
    const validateRequestForm = () => {
        const newErrors: Record<string, string> = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const visibility: Record<string, boolean> = {};
            Object.keys(newErrors).forEach((field) => {
                visibility[field] = true;
                setTimeout(() => {
                    setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
                    setTimeout(() => {
                        setErrors((prev) => {
                            const updatedErrors = { ...prev };
                            delete updatedErrors[field];
                            return updatedErrors;
                        });
                    }, 500);
                }, 3000);
            });
            setFieldErrorVisibility(visibility);
        }
        return Object.keys(newErrors).length === 0;
    };

    // Validation for reset password form
    const validateResetForm = () => {
        const newErrors: Record<string, string> = {};
        if (!newPassword) newErrors.newPassword = 'Password is required';
        else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const visibility: Record<string, boolean> = {};
            Object.keys(newErrors).forEach((field) => {
                visibility[field] = true;
                setTimeout(() => {
                    setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
                    setTimeout(() => {
                        setErrors((prev) => {
                            const updatedErrors = { ...prev };
                            delete updatedErrors[field];
                            return updatedErrors;
                        });
                    }, 500);
                }, 3000);
            });
            setFieldErrorVisibility(visibility);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateRequestForm()) return;

        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setLoading(true);

        try {
            const data = await requestPasswordReset(email);
            setMessage(data.message || 'Password reset email sent! Check your inbox.');
        } catch (err: any) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
                const visibility: Record<string, boolean> = {};
                Object.keys(err.fieldErrors).forEach((field) => {
                    visibility[field] = true;
                    setTimeout(() => {
                        setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
                        setTimeout(() => {
                            setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[field];
                                return newErrors;
                            });
                        }, 500);
                    }, 3000);
                });
                setFieldErrorVisibility(visibility);
            } else {
                setError(err.message || 'Failed to request password reset');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateResetForm() || !token) return;

        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setLoading(true);

        try {
            const data = await resetPassword(token, newPassword);
            setMessage(data.message || 'Password reset successful! Redirecting to login...');
            setTimeout(() => window.location.href = '/login', 2000);
        } catch (err: any) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
                const visibility: Record<string, boolean> = {};
                Object.keys(err.fieldErrors).forEach((field) => {
                    visibility[field] = true;
                    setTimeout(() => {
                        setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
                        setTimeout(() => {
                            setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[field];
                                return newErrors;
                            });
                        }, 500);
                    }, 3000);
                });
                setFieldErrorVisibility(visibility);
            } else {
                setError(err.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    const dismissFieldError = (field: string) => {
        setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
        setTimeout(() => {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }, 500);
    };

    useEffect(() => {
        if (error && !isExitingError) {
            const timer = setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => setError(''), 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, isExitingError]);

    useEffect(() => {
        if (message && !isExitingMessage) {
            const timer = setTimeout(() => {
                setIsExitingMessage(true);
                setTimeout(() => setMessage(''), 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, isExitingMessage]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center animate-fadeIn max-w-md w-full mx-4 my-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center justify-center">
                    <LockClosedIcon className="h-6 w-6 mr-2 text-gray-400" />
                    {token ? 'Reset Password' : 'Forgot Password'}
                </h1>

                {!token ? (
                    <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                    aria-describedby="email-error"
                                />
                            </div>
                            {errors.email && (
                                <p id="email-error" className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.email ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
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
                            className={`w-full bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 p-3 rounded-md hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    className="w-full pl-10 pr-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                    aria-describedby="newPassword-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p id="newPassword-error" className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.newPassword ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                                    {errors.newPassword}
                                    <button onClick={() => dismissFieldError('newPassword')} className="ml-2">
                                        <XMarkIcon className="h-4 w-4 text-red-500" />
                                    </button>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 p-3 rounded-md hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                        <button onClick={() => setError('')} className="ml-auto">
                            <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                        </button>
                    </p>
                )}
                {message && (
                    <p className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingMessage ? 'opacity-0' : 'opacity-100'}`}>
                        <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200" />
                        {message}
                        <button onClick={() => setMessage('')} className="ml-auto">
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
        </div>
    );
}