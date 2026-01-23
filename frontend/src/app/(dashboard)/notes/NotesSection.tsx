'use client';
import React, { useCallback, useState, useEffect } from 'react';
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
    MagnifyingGlassIcon,
    TagIcon,
    BookmarkIcon,
    ArrowPathIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { marked } from 'marked';
import { useNotesLogic } from '@/features/notes/hooks/useNotes';

// configure marked for synchronous parseing
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
    // new cool stuff
    tags: string[];
    isPinned: boolean;
}

const NoteInputForm = React.memo(
    ({
        titleValue,
        setTitleValue,
        contentValue,
        setContentValue,
        formatValue,
        setFormatValue,
        tagsValue,
        setTagsValue,
        handleSubmit,
        loading,
        userVerified,
        editingNoteId = null,
    }: {
        titleValue: string;
        setTitleValue: (value: string) => void;
        contentValue: string;
        setContentValue: (value: string) => void;
        formatValue: 'plain' | 'markdown';
        setFormatValue: (value: 'plain' | 'markdown') => void;
        tagsValue: string[];
        setTagsValue: (tags: string[]) => void;
        handleSubmit: () => void;
        loading: boolean;
        userVerified: boolean;
        editingNoteId?: string | null;
    }) => {
        const [tagInput, setTagInput] = useState('');

        return (
            <section className="glass p-8 md:p-10 rounded-3xl border-white/20 shadow-2xl animate-fade-slide-up relative overflow-hidden">
                {/* subtle header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
                            {editingNoteId ? 'Edit Note' : 'Create Note'}
                        </h3>
                        <p className="text-2xl font-black text-gray-900 dark:text-white italic">
                            Encrypted <span className="text-blue-600">Note</span>
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                        <PencilIcon className="w-6 h-6 text-blue-600" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Title Input */}
                    <div className="group">
                        <input
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            placeholder="Title..."
                            className="w-full bg-transparent text-3xl font-black text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none transition-all"
                            disabled={loading}
                        />
                        <div className="h-px w-full bg-gray-100 dark:bg-white/5 mt-2 group-focus-within:bg-blue-500 transition-colors" />
                    </div>

                    {/* Content Area */}
                    <div className="relative">
                        <textarea
                            value={contentValue}
                            onChange={(e) => setContentValue(e.target.value)}
                            placeholder="Write your note here..."
                            className="w-full bg-transparent text-lg font-medium text-gray-600 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none min-h-[160px] resize-none"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:items-end pt-4 border-t border-gray-100 dark:border-white/5">
                        {/* Tags & Format Group */}
                        <div className="flex-1 space-y-4">
                            {/* Tags Display */}
                            <div className="flex flex-wrap gap-2">
                                {tagsValue.map(tag => (
                                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors">
                                        #{tag}
                                        <button onClick={() => setTagsValue(tagsValue.filter(t => t !== tag))} className="hover:scale-125 transition-transform">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {/* Tag Input */}
                                <div className="relative flex-1">
                                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                e.preventDefault();
                                                if (!tagsValue.includes(tagInput.trim())) {
                                                    setTagsValue([...tagsValue, tagInput.trim()]);
                                                }
                                                setTagInput('');
                                            }
                                        }}
                                        placeholder="Add tag..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Format Select */}
                                <div className="relative">
                                    <select
                                        value={formatValue}
                                        onChange={(e) => setFormatValue(e.target.value as 'plain' | 'markdown')}
                                        className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        disabled={loading || !userVerified}
                                    >
                                        <option value="plain">Plain</option>
                                        <option value="markdown">MDX</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ClockIcon className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !titleValue.trim()}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center min-w-[160px]"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                editingNoteId ? 'Save Changes' : 'Create Note'
                            )}
                        </button>
                    </div>
                </div>
            </section>
        );
    }
);

const getTagColor = (tag: string) => {
    const colors = [
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

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
        newTags,
        setNewTags,
        newIsPinned,
        setNewIsPinned,
        isTrash = false,
        onFocusNote,
    }: {
        notes: Note[];
        userId: string;
        handleEditNote: (note: Note | null) => void;
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
        newTags: string[];
        setNewTags: (tags: string[]) => void;
        newIsPinned: boolean;
        setNewIsPinned: (v: boolean) => void;
        isTrash?: boolean;
        onFocusNote: (note: Note) => void;
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
            <section className="glass p-8 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.05)] transition-all animate-fadeInShort">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-500" />
                        {title === 'Your Personal Vault' ? 'My Notes' : title}
                        <span className="ml-3 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full">
                            {notes.length} total
                        </span>
                    </h3>
                </div>

                <div className="mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-12">
                            <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading notes...</p>
                        </div>
                    ) : notes.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            {notes.map((note, index) => {
                                const isShared = typeof note.owner !== 'string' && note.owner._id !== userId;
                                const sharedEntry = isShared
                                    ? note.sharedWith.find((entry) => entry.user._id.toString() === userId)
                                    : null;
                                const canEdit = isShared ? sharedEntry?.permission === 'editor' : true;
                                const ownerUsername = typeof note.owner === 'string' ? 'Unknown' : note.owner.username;
                                const staggerClass = `stagger-${(index % 5) + 1}`;

                                return (
                                    <li
                                        key={note._id}
                                        className={`glass p-6 rounded-2xl animate-fadeInShort ${staggerClass} ${note.isPinned ? 'glow-blue border-blue-500/50' : ''} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative ring-1 ring-black/5 dark:ring-white/10`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex flex-col space-y-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    {note.isPinned && (
                                                        <BookmarkSolidIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
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
                                                            {/* Current Shares List */}
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

                                                            {/* Share New Friend */}
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
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center py-20 bg-gray-50/30 dark:bg-black/10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 animate-fadeInShort">
                            <DocumentTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No notes found.</p>
                            {!isTrash && (
                                <button
                                    onClick={() => {
                                        const createTab = document.querySelector('[data-tab="create"]') as HTMLButtonElement;
                                        if (createTab) createTab.click();
                                    }}
                                    className="mt-4 text-blue-500 font-bold hover:underline"
                                >
                                    Create a note
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        );
    }
);

export default function NotesSection() {
    const {
        user,
        notes,
        trashNotes,
        showTrash,
        setShowTrash,
        searchQuery,
        setSearchQuery,
        tagFilter,
        setTagFilter,
        // create state
        createTitle,
        setCreateTitle,
        createContent,
        setCreateContent,
        createFormat,
        setCreateFormat,
        createTags,
        setCreateTags,
        // edit state
        newTitle,
        setNewTitle,
        newContent,
        setNewContent,
        newFormat,
        setNewFormat,
        newTags,
        setNewTags,
        newIsPinned,
        setNewIsPinned,
        editingNoteId,
        shareTarget,
        setShareTarget,
        sharePermission,
        setSharePermission,
        handleCreateNote,
        handleEditNote,
        handleUpdateNote,
        handleDeleteNote,
        handleRestoreNote,
        handlePermanentDelete,
        handleShareNote,
        handleUnshareNote,
        handleExportNote,
        isOwner,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
        dismissError,
        loading,
    } = useNotesLogic();

    const [activeTab, setActiveTab] = useState('owned');
    const [focusedNote, setFocusedNote] = useState<Note | null>(null);

    if (!user) return null;

    const userVerified = user.user.verified ?? false;
    const ownedNotes = notes.filter((note) => isOwner(note, user.user._id));
    const sharedNotes = notes.filter((note) => !isOwner(note, user.user._id));

    const tabs = [
        { name: 'owned', label: 'My Vault', icon: DocumentTextIcon },
        { name: 'create', label: 'New Note', icon: PencilIcon },
        ...(userVerified && sharedNotes.length > 0
            ? [{ name: 'shared', label: 'Shared Notes', icon: UsersIcon }]
            : []),
        { name: 'trash', label: 'Trash', icon: TrashIcon },
    ];

    useEffect(() => {
        if (activeTab === 'trash') setShowTrash(true);
        else setShowTrash(false);
    }, [activeTab, setShowTrash]);

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 transform transition-all duration-700 ease-in-out">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeInShort border-b border-gray-200/20 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                        <div className="p-3 bg-blue-500 rounded-2xl mr-4 shadow-xl shadow-blue-500/20">
                            <DocumentTextIcon className="w-8 h-8 text-white" />
                        </div>
                        My Notes
                    </h2>
                </div>

                <div className="flex flex-1 max-w-2xl gap-3">
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full pl-12 pr-4 py-3 border-0 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg shadow-black/5 ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
                        />
                    </div>
                    <div className="relative w-48 group hidden sm:block">
                        <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            placeholder="Search tags..."
                            className="w-full pl-12 pr-4 py-3 border-0 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg shadow-black/5 ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-sm"
                        />
                    </div>
                </div>
            </header>

            <nav className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-black/20 rounded-2xl w-fit backdrop-blur-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        data-tab={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${activeTab === tab.name
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5'
                            }`}
                    >
                        <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.name ? 'text-blue-500' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main className="animate-fadeInShort">
                {activeTab === 'create' && (
                    <div className="max-w-3xl mx-auto">
                        <NoteInputForm
                            titleValue={createTitle}
                            setTitleValue={setCreateTitle}
                            contentValue={createContent}
                            setContentValue={setCreateContent}
                            formatValue={createFormat}
                            setFormatValue={setCreateFormat}
                            tagsValue={createTags}
                            setTagsValue={setCreateTags}
                            handleSubmit={handleCreateNote}
                            loading={loading}
                            userVerified={userVerified}
                        />
                    </div>
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
                        title="My Notes"
                        editingNoteId={editingNoteId}
                        handleUpdateNote={() => handleUpdateNote()}
                        newTitle={newTitle}
                        setNewTitle={setNewTitle}
                        newContent={newContent}
                        setNewContent={setNewContent}
                        newFormat={newFormat}
                        setNewFormat={setNewFormat}
                        newTags={newTags}
                        setNewTags={setNewTags}
                        newIsPinned={newIsPinned}
                        setNewIsPinned={setNewIsPinned}
                        onFocusNote={setFocusedNote}
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
                        title="Shared with You"
                        editingNoteId={editingNoteId}
                        handleUpdateNote={() => handleUpdateNote()}
                        newTitle={newTitle}
                        setNewTitle={setNewTitle}
                        newContent={newContent}
                        setNewContent={setNewContent}
                        newFormat={newFormat}
                        setNewFormat={setNewFormat}
                        newTags={newTags}
                        setNewTags={setNewTags}
                        newIsPinned={newIsPinned}
                        setNewIsPinned={setNewIsPinned}
                        onFocusNote={setFocusedNote}
                    />
                )}
                {activeTab === 'trash' && (
                    <NotesList
                        notes={trashNotes}
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
                        title="Recently Deleted"
                        isTrash={true}
                        handleRestoreNote={handleRestoreNote}
                        handlePermanentDelete={handlePermanentDelete}
                        editingNoteId={editingNoteId}
                        handleUpdateNote={() => handleUpdateNote()}
                        newTitle={newTitle}
                        setNewTitle={setNewTitle}
                        newContent={newContent}
                        setNewContent={setNewContent}
                        newFormat={newFormat}
                        setNewFormat={setNewFormat}
                        newTags={newTags}
                        setNewTags={setNewTags}
                        newIsPinned={newIsPinned}
                        setNewIsPinned={setNewIsPinned}
                        onFocusNote={setFocusedNote}
                    />
                )}
            </main>

            {/* focus mode modal thingy for long notes */}
            {focusedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fadeInShort">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        onClick={() => setFocusedNote(null)}
                    />
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/10">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <div className="flex flex-col">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {focusedNote.title}
                                </h3>
                                <div className="flex gap-2 mt-2">
                                    {(focusedNote.tags || []).map(tag => (
                                        <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide ${getTagColor(tag)}`}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setFocusedNote(null)}
                                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-rose-500 transition-all active:scale-95"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                            <div className="prose dark:prose-invert prose-lg max-w-none">
                                {focusedNote.format === 'markdown' ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: marked.parse(focusedNote.content) as string,
                                        }}
                                    />
                                ) : (
                                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed">
                                        {focusedNote.content}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-100 dark:border-gray-700">
                            Focus Mode • Created {new Date(focusedNote.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Toast Notifications */}
            <div className="fixed top-24 right-4 z-[110] flex flex-col gap-4 pointer-events-none">
                {error && (
                    <div className={`pointer-events-auto glass p-6 rounded-2xl border-rose-500/20 shadow-2xl flex items-center gap-4 transition-all duration-500 ${isExitingError ? 'opacity-0 -translate-y-4 scale-95' : 'animate-fade-slide-up hover:scale-[1.02]'}`}>
                        <div className="p-2.5 bg-rose-500/10 rounded-xl">
                            <XCircleIcon className="h-6 w-6 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Error</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{error}</p>
                        </div>
                        <button onClick={() => dismissError()} className="p-1.5 hover:bg-rose-500/10 rounded-xl transition-all">
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                )}


                {message && (
                    <div className={`pointer-events-auto glass p-6 rounded-2xl border-emerald-500/20 shadow-2xl flex items-center gap-4 transition-all duration-500 ${isExitingMessage ? 'opacity-0 translate-x-10 scale-95' : 'animate-fade-slide-up hover:scale-[1.02]'}`}>
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                            <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Success</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{message}</p>
                        </div>
                        <button onClick={() => dismissMessage()} className="p-1.5 hover:bg-emerald-500/10 rounded-xl transition-all">
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                )}
            </div>

            <footer className="pt-12">
                {!userVerified && (
                    <section className="glass p-8 rounded-[2.5rem] border-amber-500/20 flex items-start gap-6 shadow-2xl animate-fade-slide-up">
                        <div className="p-4 bg-amber-500/10 rounded-2xl shadow-inner group-hover:rotate-6 transition-transform">
                            <LockClosedIcon className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Restricted Access</h3>
                            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                Unverified accounts are limited to <span className="font-black text-amber-600 dark:text-amber-400">one plain text note</span>.
                                Verify your email to unlock Markdown, exports, and unlimited notes.
                            </p>
                            <button className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline transition-all">
                                Verify Email Now →
                            </button>
                        </div>
                    </section>
                )}
            </footer>
        </div>
    );
}