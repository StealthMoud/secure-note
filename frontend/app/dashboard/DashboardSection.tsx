'use client';
import React from 'react';
import { useDashboardLogic } from './dashboardLogic';
import { ChartBarIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardSection() {
    const { user, message, error, loading, handleRequestVerification } = useDashboardLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <ChartBarIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Dashboard
            </h2>
            {user.user.verified ? (
                // Verified User Dashboard
                <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Card: Your Profile */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                                Your Profile
                            </h3>
                            <div className="mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                                <p>
                                    <strong>Username:</strong> {user.user.username}
                                </p>
                                <p>
                                    <strong>Email:</strong> {user.user.email}
                                </p>
                                <p>
                                    <strong>Role:</strong> {user.user.role}
                                </p>
                                <p>
                                    <strong>Joined:</strong>{' '}
                                    {new Date(user.user.createdAt || '').toLocaleDateString()}
                                </p>
                                {user.user.nickname && (
                                    <p>
                                        <strong>Nickname:</strong> {user.user.nickname}
                                    </p>
                                )}
                                {user.user.bio && (
                                    <p>
                                        <strong>Bio:</strong> {user.user.bio}
                                    </p>
                                )}
                            </div>
                            <Link href="/profile">
                                <button
                                    className="mt-4 bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 flex items-center"
                                    aria-label="View profile details"
                                >
                                    <ChartBarIcon className="w-5 h-5 mr-2" />
                                    View Profile
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                // Unverified User Dashboard
                <div className="space-y-6 mt-6">
                    <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200 max-w-md mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                            <LockClosedIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Unlock Your Full Experience
                        </h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-200 text-center">
                            Verify your email to access all features, including unlimited notes and friend connections.
                        </p>
                        <button
                            onClick={handleRequestVerification}
                            disabled={loading}
                            className="mt-4 bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 shadow-md hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center justify-center mx-auto"
                            aria-label="Request email verification"
                        >
                            <EnvelopeIcon className="w-5 h-5 mr-2" />
                            {loading ? 'Requesting...' : 'Verify Now'}
                        </button>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{error}</p>}
                        {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2 text-center">{message}</p>}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                        Need help? Contact support at{' '}
                        <a href="mailto:stealthmoud@gmail.com" className="underline">
                            stealthmoud@gmail.com
                        </a>.
                    </p>
                </div>
            )}
        </div>
    );
}