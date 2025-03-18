'use client';
import React, { useCallback } from 'react';
import { useProfileLogic } from './profileLogic';
import {
    UserIcon,
    EnvelopeIcon,
    PencilIcon,
    CheckCircleIcon,
    UsersIcon,
    CalendarIcon,
    DocumentTextIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';

export default function ProfileSection() {
    const {
        user,
        username,
        setUsername,
        friends,
        friendCount,
        totalNotes,
        sharedNotes,
        handleUpdateUsername,
        message,
        error,
        loading,
    } = useProfileLogic();

    const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value), [setUsername]);

    const joinDate = new Date(user.createdAt).toLocaleDateString();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <UserIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Profile
            </h2>
            <div className="flex flex-col gap-6">
                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <UserIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Account Details
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                                <PencilIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                <p className="text-gray-900 dark:text-gray-200">
                                    Username: <span className="font-medium">{user.username}</span>
                                </p>
                            </div>
                            <div className="flex items-center">
                                <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                <p className="text-gray-900 dark:text-gray-200">
                                    Email: <span className="font-medium">{user.email}</span>
                                </p>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                <p className="text-gray-900 dark:text-gray-200">
                                    Joined: <span className="font-medium">{joinDate}</span>
                                </p>
                            </div>
                        </div>
                    </details>
                </div>

                {/* Edit Username Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <PencilIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Edit Username
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
                                    disabled={loading || username === user.username}
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

                {/* Note Stats Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <DocumentTextIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Note Stats
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                <p className="text-gray-900 dark:text-gray-200">
                                    Total Notes: <span className="font-medium">{totalNotes}</span>
                                </p>
                            </div>
                            <div className="flex items-center">
                                <ShareIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                <p className="text-gray-900 dark:text-gray-200">
                                    Shared Notes: <span className="font-medium">{sharedNotes}</span>
                                </p>
                            </div>
                        </div>
                    </details>
                </div>

                {/* Friends Overview Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <UsersIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Friends ({friendCount})
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <p className="text-gray-900 dark:text-gray-200">
                                You have <span className="font-medium">{friendCount}</span> friend{friendCount !== 1 ? 's' : ''} to share notes with.
                            </p>
                            {friendCount > 0 ? (
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {friends.map((friend) => (
                                        <li
                                            key={friend._id}
                                            className="flex items-center text-gray-900 dark:text-gray-200"
                                        >
                                            <UserIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                            {friend.username}
                                        </li>
                                    ))}
                                    {friendCount > 3 && (
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            ...and {friendCount - 3} more friends.
                                        </p>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300">No friends yet. Add some to share securely!</p>
                            )}
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