'use client';
import { useEffect, useState } from 'react';
import { initiateOAuthLogin, loginUser, verifyTotpLogin, getCurrentUser } from '@/services/auth';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
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

export default function LoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setUser } = useDashboardSharedContext(); // Add setUser from context
    const token = searchParams.get('token');

    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [totpCode, setTotpCode] = useState<string>('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!identifier && !requires2FA) newErrors.identifier = 'Email or Username is required';
        if (!password && !requires2FA) newErrors.password = 'Password is required';
        if (requires2FA && !totpCode) newErrors.totpCode = '2FA code is required';

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
            if (!requires2FA) {
                const data = await loginUser(identifier, password);
                if (data.requires2FA) {
                    setRequires2FA(true);
                    setTempToken(data.tempToken ?? null);
                    setMessage('Please enter your 2FA code.');
                    setLoading(false);
                    return;
                }
                localStorage.setItem('token', data.token!);
                const userData = await getCurrentUser(data.token!); // Fetch user here
                setUser(userData); // Update context
                if (rememberMe) localStorage.setItem('rememberMe', 'true');
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    console.log('Redirecting to /dashboard (no 2FA)', data.token);
                    router.push('/dashboard');
                }, 1000);
            } else {
                if (!tempToken) throw new Error('Temporary token missing');
                const response = await verifyTotpLogin(tempToken, totpCode);
                localStorage.setItem('token', response.token);
                const userData = await getCurrentUser(response.token); // Fetch user here
                setUser(userData); // Update context
                if (rememberMe) localStorage.setItem('rememberMe', 'true');
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    console.log('Redirecting to /dashboard (2FA)', response.token);
                    router.push('/dashboard');
                }, 1000);
            }
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
                setIsExitingError(true);
                setTimeout(() => {
                    setIsExitingError(false);
                    setError('');
                }, 3000);
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
            setIsExitingError(true);
            setTimeout(() => {
                setIsExitingError(false);
                setError('');
            }, 3000);
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
        document.title = 'Login | Secure Note';
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setMessage('OAuth login successful! Redirecting...');
            getCurrentUser(token).then(userData => {
                setUser(userData); // Update context for OAuth
                setTimeout(() => router.push('/dashboard'), 1000);
            }).catch(err => {
                setError('Failed to fetch user after OAuth login');
                console.error(err);
            });
        }
    }, [token, router, setUser]);

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 text-center w-full max-w-md mx-auto my-12">
            {/* ... rest of the JSX remains unchanged ... */}
            <h1 className="text-3xl font-bold tracking-wide text-gray-900 dark:text-gray-100 mt-4 mb-6 flex items-center justify-center">
                <KeyIcon className="h-8 w-8 mr-2 text-gray-400 dark:text-gray-500" />
                Login
            </h1>
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
                {!requires2FA && (
                    <div className="space-y-1">
                        <label htmlFor="identifier" className="sr-only">
                            Email or Username
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Email or Username"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="identifier-error"
                                disabled={loading}
                            />
                        </div>
                        {errors.identifier && fieldErrorVisibility.identifier && (
                            <p
                                id="identifier-error"
                                className="min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center"
                            >
                                {errors.identifier}
                                <button onClick={() => dismissFieldError('identifier')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>
                )}

                {!requires2FA && (
                    <div className="space-y-1">
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 pr-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="password-error"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                disabled={loading}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && fieldErrorVisibility.password && (
                            <p
                                id="password-error"
                                className="min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center"
                            >
                                {errors.password}
                                <button onClick={() => dismissFieldError('password')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>
                )}

                {requires2FA && (
                    <div className="space-y-1">
                        <label htmlFor="totpCode" className="sr-only">
                            2FA Code
                        </label>
                        <div className="relative">
                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input
                                id="totpCode"
                                type="text"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="Enter 2FA Code"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                                aria-describedby="totpCode-error"
                                disabled={loading}
                            />
                        </div>
                        {errors.totpCode && fieldErrorVisibility.totpCode && (
                            <p
                                id="totpCode-error"
                                className="min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center"
                            >
                                {errors.totpCode}
                                <button onClick={() => dismissFieldError('totpCode')} className="ml-2">
                                    <XMarkIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </p>
                        )}
                    </div>
                )}

                {!requires2FA && (
                    <div className="flex justify-between items-center">
                        <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="mr-2 h-4 w-4 text-slate-600 focus:ring-slate-500"
                                disabled={loading}
                            />
                            Remember Me
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base flex items-center justify-center ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 mr-2 text-gray-900 dark:text-gray-100"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    ) : null}
                    {requires2FA ? 'Verify 2FA' : 'Login'}
                </button>
            </form>

            {!requires2FA && (
                <div className="mt-6 space-y-4">
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className={`w-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base flex items-center justify-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-8.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                        Login with Google
                    </button>
                    <button
                        onClick={() => handleOAuthLogin('github')}
                        disabled={loading}
                        className={`w-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base flex items-center justify-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <svg className="h-7 w-7 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.84 9.5.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-.58-1.12-.88-1.12-.88-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.564 9.564 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4 .1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.135 20.17 22 16.42 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        Login with GitHub
                    </button>
                </div>
            )}

            {error && (
                <p
                    className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingError ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                    </button>
                </p>
            )}
            {message && (
                <p
                    className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingMessage ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200" />
                    {message}
                    <button onClick={() => setMessage('')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-green-800 dark:text-gray-200" />
                    </button>
                </p>
            )}

            <p className="mt-4 text-sm text-gray-900 dark:text-gray-100">
                Don’t have an account?{' '}
                <Link
                    href="/register"
                    className="text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200"
                >
                    Register
                </Link>
            </p>
        </div>
    );
}