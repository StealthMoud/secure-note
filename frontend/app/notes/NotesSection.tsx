'use client';
import React, { useCallback } from 'react';
import {
    LockClosedIcon,
    PencilIcon,
    DocumentTextIcon,
    TrashIcon,
    ShareIcon,
    ClockIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { marked } from 'marked';
import { useNotesLogic } from './notesLogic';

// Configure marked for synchronous parsing
marked.setOptions({ async: false });

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

const NoteInputForm = React.memo(
    ({
         newTitle,
         setNewTitle,
         newContent,
         setNewContent,
         newFormat,
         setNewFormat,
         editingNoteId,
         handleCreateNote,
         handleUpdateNote,
         loading,
         userVerified,
     }: {
        newTitle: string;
        setNewTitle: (value: string) => void;
        newContent: string;
        setNewContent: (value: string) => void;
        newFormat: 'plain' | 'markdown';
        setNewFormat: (value: 'plain' | 'markdown') => void;
        editingNoteId: string | null;
        handleCreateNote: () => void;
        handleUpdateNote: () => void;
        loading: boolean;
        userVerified: boolean;
    }) => {
        const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value), [setNewTitle]);
        const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value), [setNewContent]);
        const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setNewFormat(e.target.value as 'plain' | 'markdown'), [setNewFormat]);

        return (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                    <PencilIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    {editingNoteId ? 'Edit Note' : 'Create a Note'}
                </h3>
                <div className="space-y-4 flex flex-col items-center">
                    <input
                        value={newTitle}
                        onChange={handleTitleChange}
                        placeholder="Note title"
                        className="w-full max-w-lg p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        disabled={loading}
                        aria-label="Note title"
                    />
                    <textarea
                        value={newContent}
                        onChange={handleContentChange}
                        placeholder="Write a note..."
                        className="w-full max-w-lg p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        rows={4}
                        disabled={loading}
                        aria-label="Note content"
                    />
                    <select
                        value={newFormat}
                        onChange={handleFormatChange}
                        className="w-full max-w-lg p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        disabled={loading || !userVerified}
                        aria-label="Note format"
                    >
                        <option value="plain">Plain Text</option>
                        <option value="markdown" disabled={!userVerified}>Markdown (Verified Users Only)</option>
                    </select>
                    <button
                        onClick={editingNoteId ? handleUpdateNote : handleCreateNote}
                        disabled={loading}
                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                        aria-label={editingNoteId ? 'Update note' : 'Add note'}
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : editingNoteId ? 'Update Note' : 'Add Note'}
                    </button>
                </div>
            </section>
        );
    }
);

const NotesList = React.memo(
    ({
         notes,
         userId,
         handleEditNote,
         handleDeleteNote,
         handleShareNote,
         handleUnshareNote,
         handleExportNote,
         shareTarget,
         setShareTarget,
         sharePermission,
         setSharePermission,
         isOwner,
         loading,
         userVerified,
         title = 'Your Notes',
     }: {
        notes: Note[];
        userId: string;
        handleEditNote: (note: Note) => void;
        handleDeleteNote: (noteId: string) => void;
        handleShareNote: (noteId: string) => void;
        handleUnshareNote: (noteId: string, targetUserId: string) => void;
        handleExportNote: (noteId: string, format: 'plain' | 'markdown' | 'pdf') => void;
        shareTarget: string;
        setShareTarget: (value: string) => void;
        sharePermission: 'viewer' | 'editor';
        setSharePermission: (value: 'viewer' | 'editor') => void;
        isOwner: (note: Note, userId: string) => boolean;
        loading: boolean;
        userVerified: boolean;
        title?: string;
    }) => {
        const handleShareTargetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setShareTarget(e.target.value), [setShareTarget]);
        const handlePermissionChange = useCallback(
            (e: React.ChangeEvent<HTMLSelectElement>) => setSharePermission(e.target.value as 'viewer' | 'editor'),
            [setSharePermission]
        );

        return (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                <details className="group">
                    <summary className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center">
                        <DocumentTextIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        {title} ({notes.length})
                        <span className="ml-auto group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="mt-4">
                        {loading ? (
                            <p className="text-gray-600 dark:text-gray-300">Loading notes...</p>
                        ) : notes.length > 0 ? (
                            <ul className="space-y-4 max-h-64 overflow-y-auto">
                                {notes.map((note) => {
                                    const isShared = typeof note.owner !== 'string' && note.owner._id !== userId;
                                    const sharedEntry = isShared ? note.sharedWith.find((entry) => entry.user._id.toString() === userId) : null;
                                    const canEdit = isShared ? sharedEntry?.permission === 'editor' : true;
                                    const ownerUsername = typeof note.owner === 'string' ? 'Unknown' : note.owner.username;

                                    return (
                                        <li key={note._id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <PencilIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{note.title}</h4>
                                                    {note.sharedWith.length > 0 && isOwner(note, userId) && (
                                                        <span className="ml-2 text-sm text-blue-500 dark:text-blue-300">[Shared]</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(note.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300 mt-1" />
                                                    <div className="text-gray-900 dark:text-gray-100 break-words">
                                                        {note.format === 'markdown' ? (
                                                            <div
                                                                className="prose dark:prose-invert"
                                                                dangerouslySetInnerHTML={{ __html: marked.parse(note.content) as string }}
                                                            />
                                                        ) : (
                                                            <p>{note.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {isShared && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        Shared by {ownerUsername} ({sharedEntry?.permission})
                                                    </p>
                                                )}
                                                {note.sharedWith.length > 0 && isOwner(note, userId) && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                        <p>Shared with:</p>
                                                        <ul className="list-disc pl-4">
                                                            {note.sharedWith.map((entry) => (
                                                                <li
                                                                    key={entry.user._id} // Unique key for each shared user
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    {entry.user.username} ({entry.permission})
                                                                    <button
                                                                        onClick={() => handleUnshareNote(note._id, entry.user._id)}
                                                                        disabled={loading}
                                                                        className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                                                                        aria-label={`Unshare note ${note.title} from ${entry.user.username}`}
                                                                    >
                                                                        <XMarkIcon className="w-4 h-4" />
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {isOwner(note, userId) && (
                                                    <div className="flex justify-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleEditNote(note)}
                                                            disabled={loading || (!userVerified && note.format !== 'plain')}
                                                            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                            aria-label={`Edit note ${note.title}`}
                                                        >
                                                            <PencilIcon className="w-5 h-5 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNote(note._id)}
                                                            disabled={loading}
                                                            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                            aria-label={`Delete note ${note.title}`}
                                                        >
                                                            <TrashIcon className="w-5 h-5 mr-1" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                                {isShared && canEdit && (
                                                    <div className="flex justify-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleEditNote(note)}
                                                            disabled={loading}
                                                            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                            aria-label={`Edit note ${note.title}`}
                                                        >
                                                            <PencilIcon className="w-5 h-5 mr-1" />
                                                            Edit
                                                        </button>
                                                    </div>
                                                )}
                                                {isOwner(note, userId) && userVerified && (
                                                    <details className="group mt-2">
                                                        <summary className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center">
                                                            <ShareIcon className="w-4 h-4 mr-1" />
                                                            Share
                                                            <span className="ml-auto group-open:rotate-180 transition-transform duration-200">▼</span>
                                                        </summary>
                                                        <div className="mt-2 space-y-2">
                                                            <input
                                                                value={shareTarget}
                                                                onChange={handleShareTargetChange}
                                                                placeholder="Friend's username or email"
                                                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                                disabled={loading}
                                                                aria-label={`Share note ${note.title} with friend`}
                                                            />
                                                            <select
                                                                value={sharePermission}
                                                                onChange={handlePermissionChange}
                                                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                                                    className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                                    aria-label={`Share note ${note.title}`}
                                                                >
                                                                    <ShareIcon className="w-5 h-5 mr-1" />
                                                                    Share
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </details>
                                                )}
                                                <div className="flex justify-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleExportNote(note._id, 'plain')}
                                                        disabled={loading}
                                                        className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                        aria-label={`Export ${note.title} as plain text`}
                                                    >
                                                        Export Plain
                                                    </button>
                                                    {userVerified && (
                                                        <>
                                                            <button
                                                                onClick={() => handleExportNote(note._id, 'markdown')}
                                                                disabled={loading}
                                                                className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                                aria-label={`Export ${note.title} as markdown`}
                                                            >
                                                                Export Markdown
                                                            </button>
                                                            <button
                                                                onClick={() => handleExportNote(note._id, 'pdf')}
                                                                disabled={loading}
                                                                className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-none text-gray-900 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-500 transition duration-200 disabled:opacity-50 flex items-center"
                                                                aria-label={`Export ${note.title} as PDF`}
                                                            >
                                                                Export PDF
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No notes yet.</p>
                        )}
                    </div>
                </details>
            </section>
        );
    }
);

export default function NotesSection() {
    const {
        user,
        notes,
        newTitle,
        setNewTitle,
        newContent,
        setNewContent,
        newFormat,
        setNewFormat,
        editingNoteId,
        shareTarget,
        setShareTarget,
        sharePermission,
        setSharePermission,
        handleCreateNote,
        handleEditNote,
        handleUpdateNote,
        handleDeleteNote,
        handleShareNote,
        handleUnshareNote,
        handleExportNote,
        isOwner,
        message,
        error,
        loading,
    } = useNotesLogic();

    if (!user) return null;

    const userVerified = user.user.verified ?? false;
    const ownedNotes = notes.filter((note) => isOwner(note, user.user._id));
    const sharedNotes = notes.filter((note) => !isOwner(note, user.user._id));

    return (
        <main className="max-w-4xl mx-auto p-6 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Notes
            </h2>
            {userVerified ? (
                <div className="space-y-6">
                    <NoteInputForm
                        newTitle={newTitle}
                        setNewTitle={setNewTitle}
                        newContent={newContent}
                        setNewContent={setNewContent}
                        newFormat={newFormat}
                        setNewFormat={setNewFormat}
                        editingNoteId={editingNoteId}
                        handleCreateNote={handleCreateNote}
                        handleUpdateNote={handleUpdateNote}
                        loading={loading}
                        userVerified={userVerified}
                    />
                    {message && <p className="text-sm text-green-500 dark:text-green-400">{message}</p>}
                    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                    <NotesList
                        notes={ownedNotes}
                        userId={user.user._id}
                        handleEditNote={handleEditNote}
                        handleDeleteNote={handleDeleteNote}
                        handleShareNote={handleShareNote}
                        handleUnshareNote={handleUnshareNote}
                        handleExportNote={handleExportNote}
                        shareTarget={shareTarget}
                        setShareTarget={setShareTarget}
                        sharePermission={sharePermission}
                        setSharePermission={setSharePermission}
                        isOwner={isOwner}
                        loading={loading}
                        userVerified={userVerified}
                        title="Owned Notes"
                    />
                    {sharedNotes.length > 0 && (
                        <NotesList
                            notes={sharedNotes}
                            userId={user.user._id}
                            handleEditNote={handleEditNote}
                            handleDeleteNote={handleDeleteNote}
                            handleShareNote={handleShareNote}
                            handleUnshareNote={handleUnshareNote}
                            handleExportNote={handleExportNote}
                            shareTarget={shareTarget}
                            setShareTarget={setShareTarget}
                            sharePermission={sharePermission}
                            setSharePermission={setSharePermission}
                            isOwner={isOwner}
                            loading={loading}
                            userVerified={userVerified}
                            title="Shared with Me"
                        />
                    )}
                </div>
            ) : (
                <div className="space-y-6 max-w-md mx-auto">
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                                newFormat={newFormat}
                                setNewFormat={setNewFormat}
                                editingNoteId={editingNoteId}
                                handleCreateNote={handleCreateNote}
                                handleUpdateNote={handleUpdateNote}
                                loading={loading}
                                userVerified={userVerified}
                            />
                        ) : (
                            <NotesList
                                notes={notes}
                                userId={user.user._id}
                                handleEditNote={handleEditNote}
                                handleDeleteNote={handleDeleteNote}
                                handleShareNote={handleShareNote}
                                handleUnshareNote={handleUnshareNote}
                                handleExportNote={handleExportNote}
                                shareTarget={shareTarget}
                                setShareTarget={setShareTarget}
                                sharePermission={sharePermission}
                                setSharePermission={setSharePermission}
                                isOwner={isOwner}
                                loading={loading}
                                userVerified={userVerified}
                                title="Your Note"
                            />
                        )}
                        {message && <p className="text-sm text-green-500 dark:text-green-400 mt-2">{message}</p>}
                        {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}
                    </section>
                    <section className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                            <LockClosedIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Account Status
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200">
                            Limited Access: Unverified users can only create <span className="font-semibold">one plain text note</span>. Verify your
                            email to unlock full features (Markdown, sharing, PDF/Markdown export).
                        </p>
                    </section>
                </div>
            )}
        </main>
    );
}