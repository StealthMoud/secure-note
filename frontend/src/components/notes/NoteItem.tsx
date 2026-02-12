'use client';

import React from 'react';
import {
    PencilIcon,
    TrashIcon,
    ShareIcon,
    ClockIcon,
    XMarkIcon,
    UsersIcon,
    ArrowPathIcon,
    EyeIcon,
    BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIconAlt } from '@heroicons/react/24/solid';
import { marked } from 'marked';
import { Note } from '@/types/note';
import { getTagColor } from '@/utils/tagColors';

// configure marked for synchronous parseing
marked.setOptions({ async: false });

interface NoteItemProps {
    note: Note;
    userId: string;
    index: number;
    handleEditNote: (note: Note | null) => void;
    handleDeleteNote: (noteId: string) => void;
    handleShareNote: (noteId: string) => void;
    handleUnshareNote: (noteId: string, targetUserId: string) => void;
    handleExportNote: (noteId: string, format: 'plain' | 'markdown' | 'pdf') => void;
    shareTarget: string;
    handleShareTargetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sharePermission: 'viewer' | 'editor';
    handlePermissionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    isOwner: (note: Note, userId: string) => boolean;
    loading: boolean;
    userVerified: boolean;
    handleRestoreNote?: (noteId: string) => void;
    handlePermanentDelete?: (noteId: string) => void;
    editingNoteId: string | null;
    handleUpdateNote: () => void;
    newTitle: string;
    setNewTitle: (v: string) => void;
    newContent: string;
    setNewContent: (v: string) => void;
    newFormat: 'plain' | 'markdown';
    setNewFormat: (v: 'plain' | 'markdown') => void;
    newIsPinned: boolean;
    setNewIsPinned: (v: boolean) => void;
    isTrash?: boolean;
    onFocusNote: (note: Note) => void;
}

export const NoteItem = React.memo(({
    note,
    userId,
    index,
    handleEditNote,
    handleDeleteNote,
    handleShareNote,
    handleUnshareNote,
    handleExportNote,
    shareTarget,
    handleShareTargetChange,
    sharePermission,
    handlePermissionChange,
    isOwner,
    loading,
    userVerified,
    handleRestoreNote,
    handlePermanentDelete,
    editingNoteId,
    handleUpdateNote,
    newTitle,
    setNewTitle,
    newContent,
    setNewContent,
    newFormat,
    setNewFormat,
    newIsPinned,
    setNewIsPinned,
    isTrash = false,
    onFocusNote,
}: NoteItemProps) => {
    const isShared = typeof note.owner !== 'string' && note.owner._id !== userId;
    const sharedEntry = isShared
        ? note.sharedWith.find((entry) => entry.user._id.toString() === userId)
        : null;
    const canEdit = isShared ? sharedEntry?.permission === 'editor' : true;
    const ownerUsername = typeof note.owner === 'string' ? 'Unknown' : note.owner.username;
    const staggerClass = `stagger-${(index % 5) + 1}`;

    return (
        <li
            className={`glass p-6 rounded-2xl animate-fadeInShort ${staggerClass} ${note.isPinned ? 'glow-blue border-blue-500/50' : ''} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative ring-1 ring-black/5 dark:ring-white/10`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        {note.isPinned && (
                            <BookmarkSolidAlt className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                            {note.title}
                        </h4>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-4">
                {(note.tags || []).map(tag => (
                    <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide transition-colors ${getTagColor(tag)}`}>
                        #{tag}
                    </span>
                ))}
            </div>

            {editingNoteId === note._id ? (
                <div className="space-y-4 animate-fadeInShort bg-gray-50/80 dark:bg-gray-900/80 p-5 rounded-xl border border-blue-500/30">
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="Note title"
                    />
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        rows={5}
                        placeholder="Write a note..."
                    />
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <label className="flex items-center text-xs text-gray-600 dark:text-gray-300 font-bold uppercase cursor-pointer hover:opacity-80 transition-opacity">
                            <input
                                type="checkbox"
                                checked={newIsPinned}
                                onChange={(e) => setNewIsPinned(e.target.checked)}
                                className="mr-2 h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Pin this note
                        </label>
                        <div className="flex gap-2 items-center text-[10px] font-bold uppercase text-gray-400">
                            <span>Format:</span>
                            <select
                                value={newFormat}
                                onChange={(e) => setNewFormat(e.target.value as 'plain' | 'markdown')}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 outline-none text-blue-500"
                            >
                                <option value="plain">Plain</option>
                                <option value="markdown">Markdown</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => handleEditNote(null)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-bold uppercase"
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => handleUpdateNote()}
                            disabled={loading}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Thinking...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-1 min-h-[100px] mb-4">
                        <div className="text-gray-700 dark:text-gray-200 text-sm break-words line-clamp-[8]">
                            {note.format === 'markdown' ? (
                                <div
                                    className="prose dark:prose-invert prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: marked.parse(note.content) as string,
                                    }}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap">{note.content}</p>
                            )}
                        </div>
                    </div>
                    {isShared && (
                        <div className="flex items-center text-[10px] text-gray-400 italic mb-4 bg-gray-50/50 dark:bg-black/20 p-2 rounded-lg">
                            <UsersIcon className="w-3 h-3 mr-1" />
                            Shared by {ownerUsername} ({sharedEntry?.permission})
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/20">
                        <div className="flex gap-2">
                            {isOwner(note, userId) && !isTrash && (
                                <>
                                    <button
                                        onClick={() => handleEditNote(note)}
                                        disabled={loading || (!userVerified && note.format !== 'plain')}
                                        className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-blue-500/20"
                                        title="Quick Edit"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onFocusNote(note)}
                                        className="p-2 rounded-xl text-teal-500 hover:bg-teal-500/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-teal-500/20"
                                        title="Focus Mode"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note._id)}
                                        disabled={loading}
                                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-rose-500/20"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            {isTrash && (
                                <>
                                    <button
                                        onClick={() => handleRestoreNote && handleRestoreNote(note._id)}
                                        disabled={loading}
                                        className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-emerald-500/20"
                                        title="Restore"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete && handlePermanentDelete(note._id)}
                                        disabled={loading}
                                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-600/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-rose-600/20"
                                        title="Permanently Delete"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            {isShared && (
                                <button
                                    onClick={() => onFocusNote(note)}
                                    className="p-2 rounded-xl text-teal-500 hover:bg-teal-500/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-teal-500/20"
                                    title="Focus Mode"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                            )}
                            {isShared && canEdit && (
                                <>
                                    <button
                                        onClick={() => handleEditNote(note)}
                                        disabled={loading}
                                        className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-all hover:scale-110 active:scale-90 ring-1 ring-blue-500/20"
                                        title="Quick Edit"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleExportNote(note._id, 'markdown')}
                                disabled={loading || !userVerified}
                                className="text-[10px] font-black text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest px-1.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                MD
                            </button>
                            <button
                                onClick={() => handleExportNote(note._id, 'pdf')}
                                disabled={loading || !userVerified}
                                className="text-[10px] font-black text-gray-400 hover:text-rose-500 transition-colors uppercase tracking-widest px-1.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                PDF
                            </button>
                            {isOwner(note, userId) && userVerified && (
                                <button
                                    onClick={() => {
                                        const details = document.getElementById(`share-${note._id}`);
                                        if (details) details.setAttribute('open', '');
                                    }}
                                    className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all ring-1 ring-emerald-500/20 shadow-sm shadow-emerald-500/10"
                                    title="Share Note"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    {isOwner(note, userId) && userVerified && (
                        <details id={`share-${note._id}`} className="group mt-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl transition-all border border-emerald-500/10">
                            <summary className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer p-3 flex items-center hover:opacity-80 transition-opacity">
                                <ShareIcon className="w-3.5 h-3.5 mr-2" />
                                Share Management
                                <span className="ml-auto group-open:rotate-180 transition-transform duration-300">
                                    ▼
                                </span>
                            </summary>
                            <div className="p-4 pt-0 space-y-4 animate-fadeInShort">
                                {note.sharedWith && note.sharedWith.length > 0 && (
                                    <div className="space-y-2 mb-4 b-b pb-4 border-b border-emerald-500/10">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Currently Shared With:</p>
                                        {note.sharedWith.map((entry) => (
                                            <div key={entry.user._id} className="flex items-center justify-between bg-white dark:bg-black/20 p-2.5 rounded-lg border border-emerald-500/5 group/entry transition-all hover:border-emerald-500/20">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-900 dark:text-gray-100">@{entry.user.username}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{entry.permission}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleUnshareNote(note._id, entry.user._id);
                                                    }}
                                                    disabled={loading}
                                                    className="p-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover/entry:opacity-100 transition-all hover:scale-110"
                                                    title="Revoke Access"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="relative">
                                        <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <input
                                            value={shareTarget}
                                            onChange={handleShareTargetChange}
                                            placeholder="Username or email"
                                            className="w-full pl-10 p-2.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={sharePermission}
                                            onChange={handlePermissionChange}
                                            className="flex-1 p-2.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none font-bold"
                                            disabled={loading}
                                        >
                                            <option value="viewer">Viewer Only</option>
                                            <option value="editor">Full Editor</option>
                                        </select>
                                        <button
                                            onClick={() => handleShareNote(note._id)}
                                            disabled={loading}
                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95"
                                        >
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </details>
                    )}
                </>
            )}
        </li>
    );
});

// fixed BookmarkSolidAlt usage in NoteItem
function BookmarkSolidAlt({ className }: { className: string }) {
    return <BookmarkSolidIconAlt className={className} />;
}
