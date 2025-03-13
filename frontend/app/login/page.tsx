'use client';
import { useEffect, useState } from 'react';
import { loginUser, initiateOAuthLogin } from '@/services/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    KeyIcon,
    LockClosedIcon,
    UserIcon,
    XCircleIcon,
    XMarkIcon,
    GlobeAltIcon, // For Google
    CodeBracketIcon // For GitHub
} from '@heroicons/react/24/outline';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    // Client-side validation
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!identifier) newErrors.identifier = 'Email or Username is required';
        if (!password) newErrors.password = 'Password is required';

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setFieldErrorVisibility({});
        setMessage('');
        setIsExitingError(false);
        setIsExitingMessage(false);
        setLoading(true);

        try {
            const data = await loginUser(identifier, password);
            localStorage.setItem('token', data.token);
            if (rememberMe) localStorage.setItem('rememberMe', 'true');
            setMessage('Login successful! Redirecting...');
            setTimeout(() => window.location.href = '/dashboard', 1000);
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
                setError(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            setLoading(true);
            await initiateOAuthLogin(provider);
        } catch (err: any) {
            setError(err.message || `Failed to initiate ${provider} login`);
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
        if (token) {
            localStorage.setItem('token', token);
            setMessage('OAuth login successful! Redirecting...');
            setTimeout(() => window.location.href = '/dashboard', 1000);
        }
    }, [token]);

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
                    <KeyIcon className="h-6 w-6 mr-2 text-gray-400" />
                    Login
                </h1>
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    {/* Identifier Field */}
                    <div className="space-y-1">
                        <label htmlFor="identifier" className="sr-only">Email or Username</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Email or Username"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="identifier-error"
                            />
                        </div>
                        {errors.identifier && (
                            <p id="identifier-error" className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.identifier ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                                {errors.identifier}
                                <button onClick={() => dismissFieldError('identifier')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 pr-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="password-error"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.password ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                                {errors.password}
                                <button onClick={() => dismissFieldError('password')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div className="flex justify-between items-center">
                        <label className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="mr-2 h-4 w-4 text-slate-600 focus:ring-slate-500"
                            />
                            Remember Me
                        </label>
                        <Link href="/forgot-password" className="text-sm text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200">
                            Forgot Password?
                        </Link>
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
                        Login
                    </button>
                </form>

                {/* OAuth Buttons */}
                <div className="mt-6 space-y-4">
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className={`w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-8.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
                        </svg>
                        Login with Google
                    </button>
                    <button
                        onClick={() => handleOAuthLogin('github')}
                        disabled={loading}
                        className={`w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg className="h-7 w-7 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.84 9.5.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-.58-1.12-.88-1.12-.88-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.564 9.564 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4 .1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.135 20.17 22 16.42 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        Login with GitHub
                    </button>
                </div>

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
                            <XMarkIcon className="h-5 w-5 text-green-800 dark:text-gray-200" />
                        </button>
                    </p>
                )}

                <p className="mt-4 text-sm text-gray-900 dark:text-gray-100">
                    Don’t have an account?{' '}
                    <Link href="/register" className="text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}