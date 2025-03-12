'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useDashboardLogic } from './dashboardLogic';

export default function DashboardPage() {
    const {
        user,
        notes,
        newTitle,
        setNewTitle,
        newContent,
        setNewContent,
        editingNoteId,
        shareUserId,
        setShareUserId,
        sharePermission,
        setSharePermission,
        friends,
        friendRequests,
        friendRequestUsername,
        setFriendRequestUsername,
        loading,
        message,
        error,
        handleLogout,
        handleRequestVerification,
        handleCreateNote,
        handleEditNote,
        handleUpdateNote,
        handleDeleteNote,
        handleShareNote,
        handleSendFriendRequest,
        handleRespondToFriendRequest,
        isOwner,
    } = useDashboardLogic();

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    console.log('Friends:', friends);
    console.log('Friend Requests:', friendRequests);
    console.log('Notes:', notes);

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Logout
                    </button>
                </div>
                {user ? (
                    <>
                        <p className="mb-4">Welcome, {user.user.username}!</p>
                        <div className="border p-4 rounded mb-4">
                            <h2 className="text-xl font-semibold mb-2">Friends</h2>
                            {user.user.verified ? (
                                <>
                                    <div className="mb-4">
                                        <input
                                            value={friendRequestUsername}
                                            onChange={(e) => setFriendRequestUsername(e.target.value)}
                                            placeholder="Enter username to send friend request"
                                            className="p-2 border rounded mr-2"
                                        />
                                        <button
                                            onClick={handleSendFriendRequest}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Send Friend Request
                                        </button>
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium mb-2">Your Friends</h3>
                                        {friends.length > 0 ? (
                                            <ul className="space-y-1">
                                                {friends.map((friend, index) => (
                                                    <li
                                                        key={friend._id || `friend-${index}`}
                                                        className="p-2 bg-gray-100 rounded"
                                                    >
                                                        {friend.username}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">No friends yet.</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Friend Request Logs</h3>
                                        {friendRequests.length > 0 ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-700">Incoming Requests</h4>
                                                    {friendRequests.filter(r => r.receiver._id === user.user._id).length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {friendRequests
                                                                .filter(r => r.receiver._id === user.user._id)
                                                                .map((request, index) => {
                                                                    console.log(`Request ID for ${request.sender.username}:`, request._id);
                                                                    return (
                                                                        <li
                                                                            key={request._id || `incoming-${index}`}
                                                                            className="p-2 border rounded flex justify-between items-center"
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
                                                                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                                                    >
                                                                                        Accept
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleRespondToFriendRequest(request._id, 'reject')}
                                                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                                                    >
                                                                                        Reject
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </li>
                                                                    );
                                                                })}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-gray-500">No incoming requests.</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-700">Outgoing Requests</h4>
                                                    {friendRequests.filter(r => r.sender._id === user.user._id).length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {friendRequests
                                                                .filter(r => r.sender._id === user.user._id)
                                                                .map((request, index) => (
                                                                    <li
                                                                        key={request._id || `outgoing-${index}`}
                                                                        className="p-2 border rounded"
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
                                                        <p className="text-gray-500">No outgoing requests.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No friend request activity.</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-yellow-600 mb-2">Verify your email to send or receive friend requests.</p>
                            )}
                        </div>
                        {user.user.verified ? (
                            <div className="border p-4 rounded">
                                <h2 className="text-xl font-semibold mb-2">Your Notes</h2>
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Note title"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Write a new note..."
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <button
                                    onClick={editingNoteId ? handleUpdateNote : handleCreateNote}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {editingNoteId ? 'Update Note' : 'Add Note'}
                                </button>
                                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                {notes.length > 0 ? (
                                    <ul className="mt-4 space-y-4">
                                        {notes.map((note, index) => (
                                            <li key={note._id || `note-${index}`} className="border p-2 rounded">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <strong>{note.title}</strong>: {note.content}
                                                        <span className="text-gray-500 text-sm">
                                                            {' '}
                                                            ({new Date(note.createdAt).toLocaleString()})
                                                        </span>
                                                        {typeof note.owner !== 'string' && note.owner._id !== user.user._id && (
                                                            <p className="text-gray-600 text-sm">Shared by {note.owner.username}</p>
                                                        )}
                                                    </div>
                                                    {isOwner(note, user.user._id) && (
                                                        <div className="space-x-2">
                                                            <button
                                                                onClick={() => handleEditNote(note)}
                                                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNote(note._id)}
                                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {isOwner(note, user.user._id) && (
                                                    <div className="mt-2">
                                                        <input
                                                            value={shareUserId}
                                                            onChange={(e) => setShareUserId(e.target.value)}
                                                            placeholder="User ID to share with"
                                                            className="p-1 border rounded mr-2"
                                                        />
                                                        <select
                                                            value={sharePermission}
                                                            onChange={(e) => setSharePermission(e.target.value as 'viewer' | 'editor')}
                                                            className="p-1 border rounded mr-2"
                                                        >
                                                            <option value="viewer">Viewer</option>
                                                            <option value="editor">Editor</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleShareNote(note._id)}
                                                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                        >
                                                            Share
                                                        </button>
                                                    </div>
                                                )}
                                                {note.sharedWith.length > 0 && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        Shared with:{' '}
                                                        {note.sharedWith
                                                            .map((entry) => `${entry.user.username} (${entry.permission})`)
                                                            .join(', ')}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 mt-2">No notes yet.</p>
                                )}
                            </div>
                        ) : (
                            <div className="border p-4 rounded bg-yellow-100">
                                <p className="mb-2 text-yellow-800">Your email is not verified. Limited access (1 note max).</p>
                                <button
                                    onClick={handleRequestVerification}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Request Verification
                                </button>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                                {notes.length === 0 && (
                                    <div className="mt-4">
                                        <h2 className="text-xl font-semibold mb-2">Create Your Note</h2>
                                        <input
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="Note title"
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                        <textarea
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            placeholder="Write your note (1 note max)..."
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                        <button
                                            onClick={handleCreateNote}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                )}
                                {notes.length > 0 ? (
                                    <ul className="mt-4 space-y-2">
                                        {notes.map((note, index) => (
                                            <li key={note._id || `unverified-note-${index}`} className="border p-2 rounded">
                                                <strong>{note.title}</strong>: {note.content}
                                                <span className="text-gray-500 text-sm">
                                                    {' '}
                                                    ({new Date(note.createdAt).toLocaleString()})
                                                </span>
                                                {typeof note.owner !== 'string' && note.owner._id !== user.user._id && (
                                                    <p className="text-gray-600 text-sm">Shared by {note.owner.username}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        )}
                    </>
                ) : (
                    <p>Unable to load user data.</p>
                )}
            </div>
        </ProtectedRoute>
    );
}