'use client';
import React from 'react';
import { useNotificationsLogic } from './notificationsLogic';
import {
    BellIcon,
    UserPlusIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    TrashIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function NotificationsSection() {
    const {
        notifications,
        unreadCount,
        handleMarkAsRead,
        handleClearAll,
        message,
        error,
        loading,
    } = useNotificationsLogic();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <BellIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Notifications
            </h2>
            <div className="flex flex-col gap-6">
                {/* Notification List Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <details className="group">
                        <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                            <BellIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Your Updates ({unreadCount} unread)
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            {notifications.length > 0 ? (
                                <>
                                    <ul className="space-y-4 max-h-64 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <li
                                                key={notification._id}
                                                className={`p-4 rounded border ${notification.read ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-500'}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start">
                                                        {notification.type === 'friend_request' && (
                                                            <UserPlusIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300 mt-1" />
                                                        )}
                                                        {notification.type === 'note_shared' && (
                                                            <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300 mt-1" />
                                                        )}
                                                        {notification.type === 'account' && (
                                                            <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300 mt-1" />
                                                        )}
                                                        <div>
                                                            <p className="text-gray-900 dark:text-gray-200">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                                {new Date(notification.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            disabled={loading}
                                                            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                                            aria-label={`Mark ${notification.message} as read`}
                                                        >
                                                            <CheckCircleIcon className="w-5 h-5 mr-1" />
                                                            Mark Read
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-center mt-4">
                                        <button
                                            onClick={handleClearAll}
                                            disabled={loading || notifications.length === 0}
                                            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                            aria-label="Clear all notifications"
                                        >
                                            <TrashIcon className="w-5 h-5 mr-2" />
                                            {loading ? 'Clearing...' : 'Clear All'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300">No notifications yet.</p>
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