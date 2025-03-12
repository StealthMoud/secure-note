'use client';
import {useEffect, useState} from 'react';
import {registerUser} from '@/services/auth';
import Link from 'next/link';
import {
    CheckCircleIcon,
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    UserPlusIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});

    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setFieldErrorVisibility({});
        setMessage('');
        setIsExitingError(false);
        setIsExitingMessage(false);
        try {
            const data = await registerUser(username, email, password, confirmPassword);
            setMessage(data.message || 'Registration successful!');
        } catch (err: any) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);

                const visibility: Record<string, boolean> = {};
                Object.keys(err.fieldErrors).forEach((field) => {
                    visibility[field] = true;
                    // Automatically hide each error after 3s
                    setTimeout(() => {
                        setFieldErrorVisibility((prev) => ({
                            ...prev,
                            [field]: false,
                        }));
                        setTimeout(() => {
                            setErrors((prev) => {
                                const newErrors = {...prev};
                                delete newErrors[field];
                                return newErrors;
                            });
                        }, 500); // fade out time
                    }, 3000);
                });
                setFieldErrorVisibility(visibility);
            } else {
                setError(err.message || 'Registration failed');
            }
        }
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
            <div
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center animate-fadeIn max-w-md w-full mx-4 my-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center justify-center">
                    <UserPlusIcon className="h-6 w-6 mr-2 text-gray-400"/>
                    Register
                </h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Username Field */}
                    <div className="space-y-1">
                        <div className="relative">
                            <UserIcon
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                            />
                        </div>
                        <p className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out ${fieldErrorVisibility.username ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                            {errors.username || ''}
                        </p>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                        <div className="relative">
                            <EnvelopeIcon
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                            />
                        </div>
                        <p className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out ${fieldErrorVisibility.email ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                            {errors.email || ''}
                        </p>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <div className="relative">
                            <LockClosedIcon
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                            />
                        </div>
                        <p className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out ${fieldErrorVisibility.password ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                            {errors.password || ''}
                        </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                        <div className="relative">
                            <LockClosedIcon
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                            />
                        </div>
                        <p className={`min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out ${fieldErrorVisibility.confirmPassword ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`}>
                            {errors.confirmPassword || ''}
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 p-3 rounded-md hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200"
                    >
                        Register
                    </button>
                    {error && (
                        <p className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingError ? 'opacity-0' : 'opacity-100'}`}>
                            <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200"/>
                            {error}
                        </p>
                    )}
                    {message && (
                        <p className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingMessage ? 'opacity-0' : 'opacity-100'}`}>
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200"/>
                            {message}
                        </p>
                    )}
                </form>
                <p className="mt-4 text-sm text-gray-900 dark:text-gray-100">
                    Already have an account?{' '}
                    <Link href="/login"
                          className="text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
