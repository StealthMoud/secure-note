'use client';
import React, { useCallback } from 'react';
import {
    LockClosedIcon,
    PencilIcon,
    DocumentTextIcon,
    TrashIcon,
    ShareIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { useNotesLogic } from './notesLogic';

interface Note {
    _id: string;
    title: string;
    content: string;
    format: 'plain' | 'markdown';
    encrypted: boolean;
    owner: string | { _id: string; username: string };
    createdAt: string;
    sharedWith: { user: { _id: string; username: string }; permission: 'viewer' | 'editor'; encryptedContent?: string }[];
}

// Subcomponent: Note Input Form (Non-Collapsible)
const NoteInputForm = React.memo(
    ({
         newTitle,
         setNewTitle,
         newContent,
         setNewContent,
         editingNoteId,
         handleCreateNote,
         handleUpdateNote,
         loading,
     }: {
        newTitle: string;
        setNewTitle: (value: string) => void;
        newContent: string;
        setNewContent: (value: string) => void;
        editingNoteId: string | null;
        handleCreateNote: () => void;
        handleUpdateNote: () => void;
        loading: boolean;
    }) => {
        const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value), [setNewTitle]);
        const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value), [setNewContent]);

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                    <PencilIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    {editingNoteId ? 'Edit Note' : 'Create a Note'}
                </h3>
                <div className="space-y-4 flex flex-col items-center">
                    <input
                        value={newTitle}
                        onChange={handleTitleChange}
                        placeholder="Note title"
                        className="w-full max-w-lg p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        disabled={loading}
                        aria-label="Note title"
                    />
                    <textarea
                        value={newContent}
                        onChange={handleContentChange}
                        placeholder="Write a note..."
                        className="w-full max-w-lg p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        rows={4}
                        disabled={loading}
                        aria-label="Note content"
                    />
                    <button
                        onClick={editingNoteId ? handleUpdateNote : handleCreateNote}
                        disabled={loading}
                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
                        aria-label={editingNoteId ? 'Update note' : 'Add note'}
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : editingNoteId ? 'Update Note' : 'Add Note'}
                    </button>
                </div>
            </div>
        );
    }
);

// Subcomponent: Notes List (Collapsible)
const NotesList = React.memo(
    ({
         notes,
         userId,
         handleEditNote,
         handleDeleteNote,
         handleShareNote,
         shareUserId,
         setShareUserId,
         sharePermission,
         setSharePermission,
         isOwner,
         loading,
     }: {
        notes: Note[];
        userId: string;
        handleEditNote: (note: Note) => void;
        handleDeleteNote: (noteId: string) => void;
        handleShareNote: (noteId: string) => void;
        shareUserId: string;
        setShareUserId: (value: string) => void;
        sharePermission: 'viewer' | 'editor';
        setSharePermission: (value: 'viewer' | 'editor') => void;
        isOwner: (note: Note, userId: string) => boolean;
        loading: boolean;
    }) => {
        const handleShareUserIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setShareUserId(e.target.value), [setShareUserId]);
        const handlePermissionChange = useCallback(
            (e: React.ChangeEvent<HTMLSelectElement>) => setSharePermission(e.target.value as 'viewer' | 'editor'),
            [setSharePermission]
        );

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                <details className="group">
                    <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                        <DocumentTextIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        Your Notes ({notes.length})
                        <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-4">
                        {loading ? (
                            <p className="text-gray-600 dark:text-gray-300">Loading notes...</p>
                        ) : notes.length > 0 ? (
                            <ul className="space-y-4 max-h-64 overflow-y-auto">
                                {notes.map((note) => (
                                    <li key={note._id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                                        <div className="space-y-2">
                                            {/* Title Container */}
                                            <div className="flex items-center">
                                                <PencilIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {note.title}
                                                </p>
                                            </div>
                                            {/* Created Date Container */}
                                            <div className="flex items-center">
                                                <ClockIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    {new Date(note.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {/* Body Container */}
                                            <div className="flex items-start">
                                                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300 mt-1" />
                                                <p className="text-gray-900 dark:text-gray-100 break-words">
                                                    {note.content}
                                                </p>
                                            </div>
                                            {/* Additional Info */}
                                            {typeof note.owner !== 'string' && note.owner._id !== userId && (
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">Shared by {note.owner.username}</p>
                                            )}
                                            {note.sharedWith.length > 0 && (
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    Shared with:{' '}
                                                    {note.sharedWith
                                                        .map((entry) => `${entry.user.username} (${entry.permission})`)
                                                        .join(', ')}
                                                </p>
                                            )}
                                            {/* Buttons Container */}
                                            {isOwner(note, userId) && (
                                                <div className="flex justify-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleEditNote(note)}
                                                        disabled={loading}
                                                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                                        aria-label={`Edit note ${note.title}`}
                                                    >
                                                        <PencilIcon className="w-5 h-5 mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note._id)}
                                                        disabled={loading}
                                                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                                        aria-label={`Delete note ${note.title}`}
                                                    >
                                                        <TrashIcon className="w-5 h-5 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                            {/* Share Options Container */}
                                            {isOwner(note, userId) && (
                                                <details className="group mt-2">
                                                    <summary className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center">
                                                        <ShareIcon className="w-4 h-4 mr-1" />
                                                        Share
                                                        <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                                                    </summary>
                                                    <div className="mt-2 space-y-2">
                                                        <input
                                                            value={shareUserId}
                                                            onChange={handleShareUserIdChange}
                                                            placeholder="User ID"
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                                                            disabled={loading}
                                                            aria-label={`Share note ${note.title} with user`}
                                                        />
                                                        <select
                                                            value={sharePermission}
                                                            onChange={handlePermissionChange}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                                                            disabled={loading}
                                                            aria-label={`Permission for sharing note ${note.title}`}
                                                        >
                                                            <option value="viewer">Viewer</option>
                                                            <option value="editor">Editor</option>
                                                        </select>
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => handleShareNote(note._id)}
                                                                disabled={loading}
                                                                className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-400 transition duration-200 disabled:opacity-50 flex items-center"
                                                                aria-label={`Share note ${note.title}`}
                                                            >
                                                                <ShareIcon className="w-5 h-5 mr-1" />
                                                                Share
                                                            </button>
                                                        </div>
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No notes yet.</p>
                        )}
                    </div>
                </details>
            </div>
        );
    }
);

// Main Component
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
        loading,
    } = useNotesLogic();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Notes
            </h2>
            {user.user.verified ? (
                <div className="flex flex-col gap-6">
                    <NoteInputForm
                        newTitle={newTitle}
                        setNewTitle={setNewTitle}
                        newContent={newContent}
                        setNewContent={setNewContent}
                        editingNoteId={editingNoteId}
                        handleCreateNote={handleCreateNote}
                        handleUpdateNote={handleUpdateNote}
                        loading={loading}
                    />
                    {message && <p className="text-green-500 dark:text-green-400 text-sm">{message}</p>}
                    {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    <NotesList
                        notes={notes}
                        userId={user.user._id}
                        handleEditNote={handleEditNote}
                        handleDeleteNote={handleDeleteNote}
                        handleShareNote={handleShareNote}
                        shareUserId={shareUserId}
                        setShareUserId={setShareUserId}
                        sharePermission={sharePermission}
                        setSharePermission={setSharePermission}
                        isOwner={isOwner}
                        loading={loading}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-6 max-w-md mx-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                            <PencilIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            {notes.length === 0 ? 'Create a Note' : 'Your Note'}
                        </h3>
                        {notes.length === 0 ? (
                            <NoteInputForm
                                newTitle={newTitle}
                                setNewTitle={setNewTitle}
                                newContent={newContent}
                                setNewContent={setNewContent}
                                editingNoteId={editingNoteId}
                                handleCreateNote={handleCreateNote}
                                handleUpdateNote={handleUpdateNote}
                                loading={loading}
                            />
                        ) : (
                            <NotesList
                                notes={notes}
                                userId={user.user._id}
                                handleEditNote={handleEditNote}
                                handleDeleteNote={handleDeleteNote}
                                handleShareNote={handleShareNote}
                                shareUserId={shareUserId}
                                setShareUserId={setShareUserId}
                                sharePermission={sharePermission}
                                setSharePermission={setSharePermission}
                                isOwner={isOwner}
                                loading={loading}
                            />
                        )}
                        {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2">{message}</p>}
                        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                            <LockClosedIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Account Status
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200">
                            Limited Access: You can only create <span className="font-semibold">one note</span> until your email is verified.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}