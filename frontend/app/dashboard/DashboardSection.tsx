'use client';
import React from 'react';
import { useDashboardLogic } from './dashboardLogic';
import {
    ChartBarIcon,
    LockClosedIcon,
    EnvelopeIcon,
    UserIcon,
    CalendarIcon,
    TagIcon,
    PencilIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardSection() {
    const { user, message, error, loading, handleRequestVerification } = useDashboardLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 transform transition-all duration-500 ease-in-out perspective-[1000px]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6 animate-fadeInShort">
                <ChartBarIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Dashboard
            </h2>
            {user.user.verified ? (
                // Verified User Dashboard
                <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Card: Your Profile */}
                        <div
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
                        >
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <UserIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                                Your Profile
                            </h3>
                            <div className="mt-2 text-gray-600 dark:text-gray-300 space-y-2">
                                <p className="flex items-center">
                                    <UserIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <strong>Username:</strong> {user.user.username}
                                </p>
                                <p className="flex items-center">
                                    <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <strong>Email:</strong> {user.user.email}
                                </p>
                                <p className="flex items-center">
                                    <TagIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <strong>Role:</strong> {user.user.role}
                                </p>
                                <p className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <strong>Joined:</strong>{' '}
                                    {new Date(user.user.createdAt || '').toLocaleDateString()}
                                </p>
                                {user.user.nickname && (
                                    <p className="flex items-center">
                                        <PencilIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                        <strong>Nickname:</strong> {user.user.nickname}
                                    </p>
                                )}
                                {user.user.bio && (
                                    <p className="flex items-center">
                                        <InformationCircleIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                        <strong>Bio:</strong> {user.user.bio}
                                    </p>
                                )}
                            </div>
                            <Link href="/profile">
                                <button
                                    className="mt-4 bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
                                    aria-label="View profile details"
                                >
                                    <PencilIcon className="w-5 h-5 mr-2" />
                                    View Profile
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                // Unverified User Dashboard
                <div className="space-y-6 mt-6">
                    <div
                        className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] max-w-md mx-auto animate-fadeInShort"
                    >
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
                            className={`mt-4 bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-400 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center mx-auto ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Request email verification"
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin h-5 w-5 mr-2 text-gray-900 dark:text-gray-100"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                <EnvelopeIcon className="w-5 h-5 mr-2" />
                            )}
                            {loading ? 'Requesting...' : 'Verify Now'}
                        </button>
                        {error && (
                            <p
                                className={`text-red-500 dark:text-red-400 text-sm mt-2 text-center transition-opacity duration-500 animate-fadeInShort flex items-center justify-center`}
                            >
                                <InformationCircleIcon className="w-5 h-5 mr-2 text-red-500 dark:text-red-400" />
                                {error}
                            </p>
                        )}
                        {message && (
                            <p
                                className={`text-green-500 dark:text-green-400 text-sm mt-2 text-center transition-opacity duration-500 animate-fadeInShort flex items-center justify-center`}
                            >
                                <InformationCircleIcon className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
                                {message}
                            </p>
                        )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm text-center animate-fadeInShort flex items-center justify-center">
                        <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                        Need help? Contact support at{' '}
                        <a
                            href="mailto:stealthmoud@gmail.com"
                            className="text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200 ml-1"
                        >
                            stealthmoud@gmail.com
                        </a>.
                    </p>
                </div>
            )}
        </div>
    );
}