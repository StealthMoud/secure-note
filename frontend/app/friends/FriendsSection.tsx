'use client';
import React, { useCallback } from 'react';
import { useFriendsLogic } from './friendsLogic';
import {
    UserPlusIcon,
    UsersIcon,
    EnvelopeIcon,
    CheckIcon,
    XMarkIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';

interface Friend {
    _id: string;
    username: string;
    email?: string;
}

interface FriendRequest {
    _id: string;
    sender: Friend;
    receiver: Friend;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// Subcomponent: Send Friend Request Card (Non-Collapsible)
const SendFriendRequestCard = React.memo(
    ({
         friendRequestUsername,
         setFriendRequestUsername,
         handleSendFriendRequest,
         loading,
         friendRequests,
         userId,
     }: {
        friendRequestUsername: string;
        setFriendRequestUsername: (value: string) => void;
        handleSendFriendRequest: () => void;
        loading: boolean;
        friendRequests: FriendRequest[];
        userId: string;
    }) => {
        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => setFriendRequestUsername(e.target.value),
            [setFriendRequestUsername]
        );

        const isRequestPending = friendRequests.some(
            (r) => r.sender._id === userId &&
                (r.receiver.username === friendRequestUsername || r.receiver.email === friendRequestUsername) &&
                r.status === 'pending'
        );

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <UserPlusIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    Send a Friend Request
                </h3>
                <div className="mt-4 flex justify-center items-center gap-2">
                    <input
                        value={friendRequestUsername}
                        onChange={handleChange}
                        placeholder="Enter username or email" // Update placeholder
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1 max-w-xs"
                        disabled={loading}
                        aria-label="Friend username or email" // Update aria-label
                    />
                    <button
                        onClick={handleSendFriendRequest}
                        disabled={loading || isRequestPending}
                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
                        aria-label="Send friend request"
                    >
                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Sending...' : isRequestPending ? 'Pending' : 'Send'}
                    </button>
                </div>
            </div>
        );
    }
);

// Subcomponent: Friends List Card (Collapsible)
const FriendsListCard = React.memo(({ friends, loading }: { friends: Friend[]; loading: boolean }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
        <details className="group">
            <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center cursor-pointer">
                <UsersIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                Your Friends ({friends.length})
                <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4">
                {loading ? (
                    <p className="text-gray-600 dark:text-gray-300">Loading friends...</p>
                ) : friends.length > 0 ? (
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {friends.map((friend) => (
                            <li
                                key={friend._id || friend.username} // Fallback to username if _id is missing
                                className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 flex items-center"
                            >
                                <UsersIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                {friend.username}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 dark:text-gray-300">No friends yet. Start connecting!</p>
                )}
            </div>
        </details>
    </div>
), (prevProps, nextProps) => {
    // Custom comparison for React.memo to prevent unnecessary re-renders
    return (
        prevProps.loading === nextProps.loading &&
        prevProps.friends.length === nextProps.friends.length &&
        prevProps.friends.every((friend, index) =>
            friend._id === nextProps.friends[index]._id &&
            friend.username === nextProps.friends[index].username
        )
    );
});

// Subcomponent: Friend Request Logs Card (Collapsible)
const FriendRequestLogsCard = React.memo(
    ({
         friendRequests,
         userId,
         handleRespondToFriendRequest,
         loading,
     }: {
        friendRequests: FriendRequest[];
        userId: string;
        handleRespondToFriendRequest: (requestId: string, action: 'accept' | 'reject') => void;
        loading: boolean;
    }) => {
        const incomingRequests = friendRequests.filter((r) => r.receiver._id === userId);
        const outgoingRequests = friendRequests.filter((r) => r.sender._id === userId);

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                <details className="group">
                    <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center cursor-pointer">
                        <EnvelopeIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        Friend Request Logs ({friendRequests.length})
                        <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-4 space-y-4">
                        {loading ? (
                            <p className="text-gray-600 dark:text-gray-300">Loading requests...</p>
                        ) : (
                            <>
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Incoming Requests ({incomingRequests.length})
                                    </h4>
                                    {incomingRequests.length > 0 ? (
                                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                                            {incomingRequests.map((request, index) => {
                                                // Fallback key using index if _id is missing
                                                const key = request._id || `${request.sender._id}-${request.receiver._id}-${index}`;
                                                // Optional: Log if _id is missing to diagnose
                                                if (!request._id) {
                                                    console.warn('Missing _id in request:', request);
                                                }
                                                return (
                                                    <li
                                                        key={key}
                                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded flex justify-between items-center text-gray-900 dark:text-gray-100"
                                                    >
                                                        <span>
                                                            {request.status === 'pending' &&
                                                                `${request.sender.username} sent you a request on ${new Date(
                                                                    request.createdAt
                                                                ).toLocaleString()}`}
                                                            {request.status === 'accepted' &&
                                                                `${request.sender.username}'s request was accepted on ${new Date(
                                                                    request.updatedAt
                                                                ).toLocaleString()}`}
                                                            {request.status === 'rejected' &&
                                                                `${request.sender.username}'s request was rejected on ${new Date(
                                                                    request.updatedAt
                                                                ).toLocaleString()}`}
                                                        </span>
                                                        {request.status === 'pending' && (
                                                            <div className="space-x-2 flex items-center">
                                                                <button
                                                                    onClick={() =>
                                                                        handleRespondToFriendRequest(request._id, 'accept')
                                                                    }
                                                                    disabled={loading}
                                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                                                    aria-label={`Accept request from ${request.sender.username}`}
                                                                >
                                                                    <CheckIcon className="w-5 h-5 mr-1" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRespondToFriendRequest(request._id, 'reject')
                                                                    }
                                                                    disabled={loading}
                                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                                                    aria-label={`Reject request from ${request.sender.username}`}
                                                                >
                                                                    <XMarkIcon className="w-5 h-5 mr-1" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">No incoming requests.</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Outgoing Requests ({outgoingRequests.length})
                                    </h4>
                                    {outgoingRequests.length > 0 ? (
                                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                                            {outgoingRequests.map((request, index) => {
                                                // Fallback key using index if _id is missing
                                                const key = request._id || `${request.sender._id}-${request.receiver._id}-${index}`;
                                                // Optional: Log if _id is missing to diagnose
                                                if (!request._id) {
                                                    console.warn('Missing _id in request:', request);
                                                }
                                                return (
                                                    <li
                                                        key={key}
                                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100"
                                                    >
                                                        {request.status === 'pending' &&
                                                            `You sent a request to ${request.receiver.username} on ${new Date(
                                                                request.createdAt
                                                            ).toLocaleString()}`}
                                                        {request.status === 'accepted' &&
                                                            `Your request to ${request.receiver.username} was accepted on ${new Date(
                                                                request.updatedAt
                                                            ).toLocaleString()}`}
                                                        {request.status === 'rejected' &&
                                                            `${request.receiver.username} rejected your request on ${new Date(
                                                                request.updatedAt
                                                            ).toLocaleString()}`}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">No outgoing requests.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </details>
            </div>
        );
    }
);

// Main Component
export default function FriendsSection() {
    const {
        user,
        friends,
        friendRequests,
        friendRequestUsername,
        setFriendRequestUsername,
        handleSendFriendRequest,
        handleRespondToFriendRequest,
        message,
        error,
        loading,
    } = useFriendsLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <UsersIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Friends
            </h2>
            {user.user.verified ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <SendFriendRequestCard
                            friendRequestUsername={friendRequestUsername}
                            setFriendRequestUsername={setFriendRequestUsername}
                            handleSendFriendRequest={handleSendFriendRequest}
                            loading={loading}
                            friendRequests={friendRequests}
                            userId={user.user._id}
                        />
                        {message && (
                            <p className="text-green-500 dark:text-green-400 text-sm">{message}</p>
                        )}
                        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="space-y-6">
                        <FriendsListCard friends={friends} loading={loading} />
                        <FriendRequestLogsCard
                            friendRequests={friendRequests}
                            userId={user.user._id}
                            handleRespondToFriendRequest={handleRespondToFriendRequest}
                            loading={loading}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200 max-w-md mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                        <LockClosedIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        Connect with Friends
                    </h3>
                    <p className="mt-2 text-gray-700 dark:text-gray-200 text-center">
                        Verify your email to start sending and receiving friend requests.
                    </p>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm text-center">
                        Unlock the power of connection—verify now!
                    </p>
                </div>
            )}
        </div>
    );
}