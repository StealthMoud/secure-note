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
    CheckCircleIcon,
    XCircleIcon,
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
            (r) =>
                r.sender._id === userId &&
                (r.receiver.username === friendRequestUsername ||
                    r.receiver.email === friendRequestUsername) &&
                r.status === 'pending'
        );

        return (
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
            >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <UserPlusIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    Send a Friend Request
                </h3>
                <div className="mt-4 flex justify-center items-center gap-2">
                    <div className="relative flex-1 max-w-xs">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                        <input
                            value={friendRequestUsername}
                            onChange={handleChange}
                            placeholder="Enter username or email"
                            className="w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                            disabled={loading}
                            aria-label="Friend username or email"
                        />
                    </div>
                    <button
                        onClick={handleSendFriendRequest}
                        disabled={loading || isRequestPending}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center whitespace-nowrap ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Send friend request"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 mr-2 text-white"
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
                        {loading ? 'Sending...' : isRequestPending ? 'Pending' : 'Send'}
                    </button>
                </div>
            </div>
        );
    }
);

// Subcomponent: Friends List Card (Collapsible)
const FriendsListCard = React.memo(
    ({ friends, loading }: { friends: Friend[]; loading: boolean }) => (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
        >
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
                                    key={friend._id || friend.username}
                                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 flex items-center animate-fadeInShort"
                                >
                                    <UsersIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
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
    ),
    (prevProps, nextProps) => {
        return (
            prevProps.loading === nextProps.loading &&
            prevProps.friends.length === nextProps.friends.length &&
            prevProps.friends.every(
                (friend, index) =>
                    friend._id === nextProps.friends[index]._id &&
                    friend.username === nextProps.friends[index].username
            )
        );
    }
);

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
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
            >
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
                                                const key =
                                                    request._id ||
                                                    `${request.sender._id}-${request.receiver._id}-${index}`;
                                                if (!request._id) {
                                                    console.warn('Missing _id in request:', request);
                                                }
                                                return (
                                                    <li
                                                        key={key}
                                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded flex justify-between items-center text-gray-900 dark:text-gray-100 animate-fadeInShort"
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
                                                                        handleRespondToFriendRequest(
                                                                            request._id,
                                                                            'accept'
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
                                                                    aria-label={`Accept request from ${request.sender.username}`}
                                                                >
                                                                    <CheckIcon className="w-5 h-5 mr-1" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRespondToFriendRequest(
                                                                            request._id,
                                                                            'reject'
                                                                        )
                                                                    }
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
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            No incoming requests.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Outgoing Requests ({outgoingRequests.length})
                                    </h4>
                                    {outgoingRequests.length > 0 ? (
                                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                                            {outgoingRequests.map((request, index) => {
                                                const key =
                                                    request._id ||
                                                    `${request.sender._id}-${request.receiver._id}-${index}`;
                                                if (!request._id) {
                                                    console.warn('Missing _id in request:', request);
                                                }
                                                return (
                                                    <li
                                                        key={key}
                                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 animate-fadeInShort"
                                                    >
                                                        {request.status === 'pending' &&
                                                            `You sent a request to ${
                                                                request.receiver.username
                                                            } on ${new Date(
                                                                request.createdAt
                                                            ).toLocaleString()}`}
                                                        {request.status === 'accepted' &&
                                                            `Your request to ${
                                                                request.receiver.username
                                                            } was accepted on ${new Date(
                                                                request.updatedAt
                                                            ).toLocaleString()}`}
                                                        {request.status === 'rejected' &&
                                                            `${
                                                                request.receiver.username
                                                            } rejected your request on ${new Date(
                                                                request.updatedAt
                                                            ).toLocaleString()}`}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            No outgoing requests.
                                        </p>
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
        isExitingError,
        isExitingMessage,
        dismissMessage,
        loading,
    } = useFriendsLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 transform transition-all duration-500 ease-in-out perspective-[1000px]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6 animate-fadeInShort">
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
                        {error && (
                            <p
                                className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                                    isExitingError
                                        ? 'opacity-0'
                                        : 'opacity-100 animate-fadeInShort'
                                }`}
                            >
                                <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                                {error}
                                <button
                                    onClick={() => dismissMessage('error')}
                                    className="ml-auto"
                                >
                                    <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                                </button>
                            </p>
                        )}
                        {message && (
                            <p
                                className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                                    isExitingMessage
                                        ? 'opacity-0'
                                        : 'opacity-100 animate-fadeInShort'
                                }`}
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200" />
                                {message}
                                <button
                                    onClick={() => dismissMessage('message')}
                                    className="ml-auto"
                                >
                                    <XMarkIcon className="h-5 w-5 text-green-800 dark:text-green-200" />
                                </button>
                            </p>
                        )}
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
                <div
                    className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort max-w-md mx-auto"
                >
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