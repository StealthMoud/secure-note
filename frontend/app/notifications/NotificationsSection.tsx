// /app/notifications/NotificationsSection.tsx
'use client';
import React from 'react';
import { BellIcon, EnvelopeIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { useNotificationsLogic } from './notificationsLogic';

// Define interfaces for the data structures
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
    owner: string | User; // Can be a string (ID) or User object
    createdAt: string;
    sharedWith: SharedWith[];
}

export default function NotificationsSection() {
    const { user, refreshNotifications } = useDashboardSharedContext();
    const { friendRequests, sharedNotes, loading, respondToFriendRequest } = useNotificationsLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <BellIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Notifications
            </h2>
            {loading ? (
                <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
            ) : (
                <div className="space-y-6">
                    {/* Friend Requests */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <EnvelopeIcon className="w-6 h-6 mr-2" />
                            Friend Requests ({friendRequests.length})
                        </h3>
                        {friendRequests.length > 0 ? (
                            <ul className="mt-4 space-y-2">
                                {friendRequests.map((request: FriendRequest) => (
                                    <li key={request._id} className="p-2 border rounded flex justify-between items-center">
                                        <span>
                                            {request.sender._id === user.user._id
                                                ? `You sent a request to ${request.receiver.username}`
                                                : `${request.sender.username} sent you a request`}
                                            {' on ' + new Date(request.createdAt).toLocaleString()}
                                        </span>
                                        {request.status === 'pending' && request.receiver._id === user.user._id && (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => respondToFriendRequest(request._id, 'accept')}
                                                    className="bg-green-500 text-white px-2 py-1 rounded"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => respondToFriendRequest(request._id, 'reject')}
                                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-gray-600 dark:text-gray-300">No friend requests.</p>
                        )}
                    </div>

                    {/* Note Sharing */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <ShareIcon className="w-6 h-6 mr-2" />
                            Note Sharing ({sharedNotes.length})
                        </h3>
                        {sharedNotes.length > 0 ? (
                            <ul className="mt-4 space-y-2">
                                {sharedNotes.map((note: Note) => (
                                    <li key={note._id} className="p-2 border rounded">
                                        {typeof note.owner !== 'string' && note.owner._id !== user.user._id
                                            ? `${note.owner.username} shared "${note.title}" with you on ${new Date(note.createdAt).toLocaleString()}`
                                            : `You shared "${note.title}" with ${note.sharedWith.map((u: SharedWith) => u.user.username).join(', ')} on ${new Date(note.createdAt).toLocaleString()}`}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-gray-600 dark:text-gray-300">No shared notes.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}