'use client';
import React, { useCallback } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import {
    UserIcon,
    EnvelopeIcon,
    SunIcon,
    MoonIcon,
    CheckCircleIcon,
    LockClosedIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

export default function AccountSettingsSection() {
    const {
        user,
        username,
        setUsername,
        isDarkMode,
        toggleTheme,
        handleRequestVerification,
        handleUpdateUsername,
        message,
        error,
        loading,
    } = useAccountSettingsLogic();

    const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value), [setUsername]);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <UserIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Account Settings
            </h2>
            <div className="flex flex-col gap-6">
                {/* Username Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <PencilIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Username
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <input
                                value={username}
                                onChange={handleUsernameChange}
                                placeholder="Enter new username"
                                className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                                disabled={loading}
                                aria-label="Username"
                            />
                            <div className="flex justify-center">
                                <button
                                    onClick={handleUpdateUsername}
                                    disabled={loading || username === user.user.username}
                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                    aria-label="Update username"
                                >
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    {loading ? 'Updating...' : 'Update Username'}
                                </button>
                            </div>
                        </div>
                    </details>
                </div>

                {/* Email Verification Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <EnvelopeIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Email Verification
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <p className="text-gray-900 dark:text-gray-200">
                                Email: <span className="font-medium">{user.user.email}</span>
                            </p>
                            {user.user.verified ? (
                                <p className="text-green-500 dark:text-green-400 flex items-center">
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    Verified
                                </p>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                        <LockClosedIcon className="w-5 h-5 mr-2" />
                                        Not Verified
                                    </p>
                                    <button
                                        onClick={handleRequestVerification}
                                        disabled={loading}
                                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                        aria-label="Request email verification"
                                    >
                                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                                        {loading ? 'Requesting...' : 'Verify Now'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </details>
                </div>

                {/* Theme Toggle Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            {isDarkMode ? (
                                <MoonIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <SunIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            )}
                            Appearance
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={toggleTheme}
                                className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 flex items-center"
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="w-5 h-5 mr-2" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 mr-2" />
                                )}
                                Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                            </button>
                        </div>
                    </details>
                </div>

                {/* Messages */}
                {message && <p className="text-green-500 dark:text-green-400 text-sm">{message}</p>}
                {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
            </div>
        </div>
    );
}