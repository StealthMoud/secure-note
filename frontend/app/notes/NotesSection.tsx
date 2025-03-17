'use client';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useNotesLogic } from './notesLogic';

export default function NotesSection() {
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
        handleCreateNote,
        handleEditNote,
        handleUpdateNote,
        handleDeleteNote,
        handleShareNote,
        isOwner,
        message,
        error,
        handleRequestVerification,
    } = useNotesLogic();

    if (!user) return null;

    return (
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Your Notes</h2>
            {user.user.verified ? (
                <>
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Note title"
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded mb-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Write a new note..."
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded mb-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                        onClick={editingNoteId ? handleUpdateNote : handleCreateNote}
                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base"
                    >
                        {editingNoteId ? 'Update Note' : 'Add Note'}
                    </button>
                    {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2">{message}</p>}
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
                    {notes.length > 0 ? (
                        <ul className="mt-4 space-y-4">
                            {notes.map((note, index) => (
                                <li key={note._id || `note-${index}`} className="border border-gray-200 dark:border-gray-700 p-2 rounded">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <strong className="text-gray-900 dark:text-gray-100">{note.title}</strong>: <span className="text-gray-900 dark:text-gray-100">{note.content}</span>
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                {' '}
                                                ({new Date(note.createdAt).toLocaleString()})
                                            </span>
                                            {typeof note.owner !== 'string' && note.owner._id !== user.user._id && (
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">Shared by {note.owner.username}</p>
                                            )}
                                        </div>
                                        {isOwner(note, user.user._id) && (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => handleEditNote(note)}
                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200"
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
                                                className="p-1 border border-gray-200 dark:border-gray-700 rounded mr-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                            <select
                                                value={sharePermission}
                                                onChange={(e) => setSharePermission(e.target.value as 'viewer' | 'editor')}
                                                className="p-1 border border-gray-200 dark:border-gray-700 rounded mr-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="editor">Editor</option>
                                            </select>
                                            <button
                                                onClick={() => handleShareNote(note._id)}
                                                className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200"
                                            >
                                                Share
                                            </button>
                                        </div>
                                    )}
                                    {note.sharedWith.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                        <p className="text-gray-500 dark:text-gray-400 mt-2">No notes yet.</p>
                    )}
                </>
            ) : (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded">
                    <p className="mb-2 text-yellow-800 dark:text-yellow-400">Your email is not verified. Limited access (1 note max).</p>
                    <button
                        onClick={handleRequestVerification}
                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base"
                    >
                        Request Verification
                    </button>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
                    {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2">{message}</p>}
                    {notes.length === 0 && (
                        <div className="mt-4">
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Note title"
                                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded mb-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Write your note (1 note max)..."
                                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded mb-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                                onClick={handleCreateNote}
                                className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 text-base"
                            >
                                Add Note
                            </button>
                        </div>
                    )}
                    {notes.length > 0 && (
                        <ul className="mt-4 space-y-2">
                            {notes.map((note, index) => (
                                <li key={note._id || `unverified-note-${index}`} className="border border-gray-200 dark:border-gray-700 p-2 rounded">
                                    <strong className="text-gray-900 dark:text-gray-100">{note.title}</strong>: <span className="text-gray-900 dark:text-gray-100">{note.content}</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                        {' '}
                                        ({new Date(note.createdAt).toLocaleString()})
                                    </span>
                                    {typeof note.owner !== 'string' && note.owner._id !== user.user._id && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Shared by {note.owner.username}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}