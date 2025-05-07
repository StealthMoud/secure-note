'use client';
import React, { useCallback, useState } from 'react';
import {
    LockClosedIcon,
    PencilIcon,
    DocumentTextIcon,
    TrashIcon,
    ShareIcon,
    ClockIcon,
    XMarkIcon,
    UsersIcon,
    CheckCircleIcon,
    XCircleIcon,
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
        const handleTitleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value),
            [setNewTitle]
        );
        const handleContentChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value),
            [setNewContent]
        );
        const handleFormatChange = useCallback(
            (e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewFormat(e.target.value as 'plain' | 'markdown'),
            [setNewFormat]
        );

        return (
            <section
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
            >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                    <PencilIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    {editingNoteId ? 'Edit Note' : 'Create a Note'}
                </h3>
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative w-full max-w-lg">
                        <PencilIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                        <input
                            value={newTitle}
                            onChange={handleTitleChange}
                            placeholder="Note title"
                            className="w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                            disabled={loading}
                            aria-label="Note title"
                        />
                    </div>
                    <div className="relative w-full max-w-lg">
                        <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                        <textarea
                            value={newContent}
                            onChange={handleContentChange}
                            placeholder="Write a note..."
                            className="w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                            rows={4}
                            disabled={loading}
                            aria-label="Note content"
                        />
                    </div>
                    <select
                        value={newFormat}
                        onChange={handleFormatChange}
                        className="w-full max-w-lg p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                        disabled={loading || !userVerified}
                        aria-label="Note format"
                    >
                        <option value="plain">Plain Text</option>
                        <option value="markdown" disabled={!userVerified}>
                            Markdown (Verified Users Only)
                        </option>
                    </select>
                    <button
                        onClick={editingNoteId ? handleUpdateNote : handleCreateNote}
                        disabled={loading}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label={editingNoteId ? 'Update note' : 'Add note'}
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
                            <DocumentTextIcon className="w-5 h-5 mr-2" />
                        )}
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
        const handleShareTargetChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => setShareTarget(e.target.value),
            [setShareTarget]
        );
        const handlePermissionChange = useCallback(
            (e: React.ChangeEvent<HTMLSelectElement>) =>
                setSharePermission(e.target.value as 'viewer' | 'editor'),
            [setSharePermission]
        );

        return (
            <section
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
            >
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
                                    const sharedEntry = isShared
                                        ? note.sharedWith.find((entry) => entry.user._id.toString() === userId)
                                        : null;
                                    const canEdit = isShared ? sharedEntry?.permission === 'editor' : true;
                                    const ownerUsername =
                                        typeof note.owner === 'string' ? 'Unknown' : note.owner.username;

                                    return (
                                        <li
                                            key={note._id}
                                            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg animate-fadeInShort"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <PencilIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        {note.title}
                                                    </h4>
                                                    {note.sharedWith.length > 0 && isOwner(note, userId) && (
                                                        <span className="ml-2 text-sm text-blue-500 dark:text-blue-300">
                                                            [Shared]
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {new Date(note.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-start">
                                                    <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400 mt-1" />
                                                    <div className="text-gray-900 dark:text-gray-100 break-words">
                                                        {note.format === 'markdown' ? (
                                                            <div
                                                                className="prose dark:prose-invert"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: marked.parse(note.content) as string,
                                                                }}
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
                                                                    key={entry.user._id}
                                                                    className="flex items-center justify-between animate-fadeInShort"
                                                                >
                                                                    {entry.user.username} ({entry.permission})
                                                                    <button
                                                                        onClick={() =>
                                                                            handleUnshareNote(note._id, entry.user._id)
                                                                        }
                                                                        disabled={loading}
                                                                        className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center transition duration-200"
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
                                                            disabled={
                                                                loading ||
                                                                (!userVerified && note.format !== 'plain')
                                                            }
                                                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
                                                            aria-label={`Edit note ${note.title}`}
                                                        >
                                                            <PencilIcon className="w-5 h-5 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNote(note._id)}
                                                            disabled={loading}
                                                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
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
                                                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
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
                                                            <span className="ml-auto group-open:rotate-180 transition-transform duration-200">
                                                                ▼
                                                            </span>
                                                        </summary>
                                                        <div className="mt-2 space-y-2">
                                                            <div className="relative">
                                                                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                                                                <input
                                                                    value={shareTarget}
                                                                    onChange={handleShareTargetChange}
                                                                    placeholder="Friend's username or email"
                                                                    className="w-full pl-10 p-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                                                    disabled={loading}
                                                                    aria-label={`Share note ${note.title} with friend`}
                                                                />
                                                            </div>
                                                            <select
                                                                value={sharePermission}
                                                                onChange={handlePermissionChange}
                                                                className="w-full p-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
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
                                                                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center"
                                                                    aria-label={`Share note ${note.title}`}
                                                                >
                                                                    <ShareIcon className="w-5 h-5 mr-1" />
                                                                    Share
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </details>
                                                )}
                                                <div className="flex justify-center gap-2 mt-2 flex-wrap">
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
                                                                onClick={() =>
                                                                    handleExportNote(note._id, 'markdown')
                                                                }
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
        isExitingError,
        isExitingMessage,
        dismissMessage,
        loading,
    } = useNotesLogic();

    const [activeTab, setActiveTab] = useState('create');

    if (!user) return null;

    const userVerified = user.user.verified ?? false;
    const ownedNotes = notes.filter((note) => isOwner(note, user.user._id));
    const sharedNotes = notes.filter((note) => !isOwner(note, user.user._id));

    const tabs = [
        { name: 'create', label: 'Create/Edit Note', icon: PencilIcon },
        { name: 'owned', label: 'Owned Notes', icon: DocumentTextIcon },
        ...(userVerified && sharedNotes.length > 0
            ? [{ name: 'shared', label: 'Shared Notes', icon: UsersIcon }]
            : []),
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 transform transition-all duration-500 ease-in-out perspective-[1000px]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6 animate-fadeInShort">
                <DocumentTextIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Your Notes
            </h2>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center px-4 py-2 text-sm font-medium transition-all duration-500 ease-in-out transform hover:scale-105 ${
                            activeTab === tab.name
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-6 space-y-6">
                {activeTab === 'create' && (
                    userVerified ? (
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
                        notes.length === 0 ? (
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
                        )
                    )
                )}
                {activeTab === 'owned' && (
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
                )}
                {activeTab === 'shared' && userVerified && sharedNotes.length > 0 && (
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
                {!userVerified && (
                    <section
                        className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                            <LockClosedIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                            Account Status
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200">
                            Limited Access: Unverified users can only create{' '}
                            <span className="font-semibold">one plain text note</span>. Verify your
                            email to unlock full features (Markdown, sharing, PDF/Markdown export).
                        </p>
                    </section>
                )}
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
                            <XMarkIcon className="h-5 w-5 text-green-800 dark:text-red-200" />
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}