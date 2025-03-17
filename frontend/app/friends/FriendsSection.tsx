'use client';
import { useFriendsLogic } from './friendsLogic';

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
    } = useFriendsLogic();

    if (!user) return null;

    return (
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Friends</h2>
            {user.user.verified ? (
                <>
                    <div className="mb-4">
                        <input
                            value={friendRequestUsername}
                            onChange={(e) => setFriendRequestUsername(e.target.value)}
                            placeholder="Enter username to send friend request"
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded mr-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            onClick={handleSendFriendRequest}
                            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base"
                        >
                            Send Friend Request
                        </button>
                    </div>
                    {message && <p className="text-green-500 dark:text-green-400 text-sm mb-2">{message}</p>}
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Your Friends</h3>
                        {friends.length > 0 ? (
                            <ul className="space-y-1">
                                {friends.map((friend, index) => (
                                    <li
                                        key={friend._id || `friend-${index}`}
                                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
                                    >
                                        {friend.username}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No friends yet.</p>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Friend Request Logs</h3>
                        {friendRequests.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Incoming Requests</h4>
                                    {friendRequests.filter(r => r.receiver._id === user.user._id).length > 0 ? (
                                        <ul className="space-y-2">
                                            {friendRequests
                                                .filter(r => r.receiver._id === user.user._id)
                                                .map((request, index) => (
                                                    <li
                                                        key={request._id || `incoming-${index}`}
                                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded flex justify-between items-center text-gray-900 dark:text-gray-100"
                                                    >
                                                        <span>
                                                            {request.status === 'pending' &&
                                                                `${request.sender.username} sent you a friend request on ${new Date(request.createdAt).toLocaleString()} - Awaiting your response`}
                                                            {request.status === 'accepted' &&
                                                                `${request.sender.username}'s friend request was accepted on ${new Date(request.updatedAt).toLocaleString()}`}
                                                            {request.status === 'rejected' &&
                                                                `${request.sender.username}'s friend request was rejected on ${new Date(request.updatedAt).toLocaleString()}`}
                                                        </span>
                                                        {request.status === 'pending' && (
                                                            <div className="space-x-2">
                                                                <button
                                                                    onClick={() => handleRespondToFriendRequest(request._id, 'accept')}
                                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRespondToFriendRequest(request._id, 'reject')}
                                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No incoming requests.</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Outgoing Requests</h4>
                                    {friendRequests.filter(r => r.sender._id === user.user._id).length > 0 ? (
                                        <ul className="space-y-2">
                                            {friendRequests
                                                .filter(r => r.sender._id === user.user._id)
                                                .map((request, index) => (
                                                    <li
                                                        key={request._id || `outgoing-${index}`}
                                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100"
                                                    >
                                                        {request.status === 'pending' &&
                                                            `You sent a friend request to ${request.receiver.username} on ${new Date(request.createdAt).toLocaleString()} - Awaiting their response`}
                                                        {request.status === 'accepted' &&
                                                            `Your friend request to ${request.receiver.username} was accepted on ${new Date(request.updatedAt).toLocaleString()}`}
                                                        {request.status === 'rejected' &&
                                                            `${request.receiver.username} rejected your friend request on ${new Date(request.updatedAt).toLocaleString()}`}
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No outgoing requests.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No friend request activity.</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-yellow-600 dark:text-yellow-400 mb-2">Verify your email to send or receive friend requests.</p>
            )}
        </div>
    );
}