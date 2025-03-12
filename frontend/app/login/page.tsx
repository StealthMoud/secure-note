'use client';
import {useEffect, useState} from 'react';
import {loginUser} from '@/services/auth';
import Link from 'next/link';
import {CheckCircleIcon, KeyIcon, LockClosedIcon, UserIcon, XCircleIcon} from '@heroicons/react/24/outline';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsExitingError(false);
        setIsExitingMessage(false);
        try {
            const data = await loginUser(identifier, password);
            localStorage.setItem('token', data.token);
            setMessage('Login successful! Redirecting...');
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } catch (err: any) {
            setError(err.message || 'Login failed');
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
                    <KeyIcon className="h-6 w-6 mr-2 text-gray-400"/>
                    Login
                </h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Email or Username"
                            className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                        />
                    </div>
                    <div className="relative">
                        <LockClosedIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 p-3 rounded-md hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200"
                    >
                        Login
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
                    Don’t have an account?{' '}
                    <Link href="/register"
                          className="text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}