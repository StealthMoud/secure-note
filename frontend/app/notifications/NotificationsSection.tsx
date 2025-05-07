'use client';
import React from 'react';
import {
    BellIcon,
    EnvelopeIcon,
    ShareIcon,
    CheckIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { useNotificationsLogic } from './notificationsLogic';

interface User {
    _id: string;
    username: string;
}

interface FriendRequest {
    _id: string;
    sender: User;
    receiver: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

interface SharedWith {
    user: User;
    permission: 'viewer' | 'editor';
    encryptedContent?: string;
}

interface Note {
    _id: string;
    title: string;
    content: string;
    format: 'plain' | 'markdown';
    encrypted: boolean;
    owner: string | User;
    createdAt: string;
    sharedWith: SharedWith[];
}

export default function NotificationsSection() {
    const { user, refreshNotifications } = useDashboardSharedContext();
    const {
        friendRequests,
        sharedNotes,
        loading,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
        respondToFriendRequest,
    } = useNotificationsLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 transform transition-all duration-500 ease-in-out perspective-[1000px]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6 animate-fadeInShort">
                <BellIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Notifications
            </h2>
            {loading ? (
                <p className="text-gray-600 dark:text-gray-300 animate-fadeInShort">Loading notifications...</p>
            ) : (
                <div className="space-y-6">
                    {/* Friend Requests */}
                    <div
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <EnvelopeIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Friend Requests ({friendRequests.length})
                        </h3>
                        {friendRequests.length > 0 ? (
                            <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                                {friendRequests.map((request: FriendRequest) => (
                                    <li
                                        key={request._id}
                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded flex justify-between items-center text-gray-900 dark:text-gray-100 animate-fadeInShort"
                                    >
                                        <span>
                                            {request.sender._id === user.user._id
                                                ? `You sent a request to ${request.receiver.username}`
                                                : `${request.sender.username} sent you a request`}{' '}
                                            on {new Date(request.createdAt).toLocaleString()}
                                        </span>
                                        {request.status === 'pending' && request.receiver._id === user.user._id && (
                                            <div className="space-x-2 flex items-center">
                                                <button
                                                    onClick={() => respondToFriendRequest(request._id, 'accept')}
                                                    disabled={loading}
                                                    className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
                                                    aria-label={`Accept request from ${request.sender.username}`}
                                                >
                                                    <CheckIcon className="w-5 h-5 mr-1" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => respondToFriendRequest(request._id, 'reject')}
                                                    disabled={loading}
                                                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
                                                    aria-label={`Reject request from ${request.sender.username}`}
                                                >
                                                    <XMarkIcon className="w-5 h-5 mr-1" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-gray-600 dark:text-gray-300 animate-fadeInShort">
                                No friend requests.
                            </p>
                        )}
                    </div>

                    {/* Note Sharing */}
                    <div
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <ShareIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Note Sharing ({sharedNotes.length})
                        </h3>
                        {sharedNotes.length > 0 ? (
                            <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                                {sharedNotes.map((note: Note) => (
                                    <li
                                        key={note._id}
                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 animate-fadeInShort"
                                    >
                                        {typeof note.owner !== 'string' && note.owner._id !== user.user._id
                                            ? `${note.owner.username} shared "${note.title}" with you on ${new Date(
                                                note.createdAt
                                            ).toLocaleString()}`
                                            : `You shared "${note.title}" with ${note.sharedWith
                                                .map((u: SharedWith) => u.user.username)
                                                .join(', ')} on ${new Date(note.createdAt).toLocaleString()}`}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-gray-600 dark:text-gray-300 animate-fadeInShort">
                                No shared notes.
                            </p>
                        )}
                    </div>

                    {/* Messages */}
                    {error && (
                        <p
                            className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                                isExitingError ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                            }`}
                        >
                            <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                            {error}
                            <button onClick={() => dismissMessage('error')} className="ml-auto">
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
                            <button onClick={() => dismissMessage('message')} className="ml-auto">
                                <XMarkIcon className="h-5 w-5 text-green-800 dark:text-green-200" />
                            </button>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}