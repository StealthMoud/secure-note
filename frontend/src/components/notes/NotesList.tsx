'use client';

import React, { useCallback } from 'react';
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { NoteItem } from './NoteItem';
import { Note } from '@/types/note';

interface NotesListProps {
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
}

export const NotesList = React.memo(({
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
}: NotesListProps) => {
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
                        {notes.map((note, index) => (
                            <NoteItem
                                key={note._id}
                                note={note}
                                userId={userId}
                                index={index}
                                handleEditNote={handleEditNote}
                                handleDeleteNote={handleDeleteNote}
                                handleShareNote={handleShareNote}
                                handleUnshareNote={handleUnshareNote}
                                handleExportNote={handleExportNote}
                                shareTarget={shareTarget}
                                handleShareTargetChange={handleShareTargetChange}
                                sharePermission={sharePermission}
                                handlePermissionChange={handlePermissionChange}
                                isOwner={isOwner}
                                loading={loading}
                                userVerified={userVerified}
                                handleRestoreNote={handleRestoreNote}
                                handlePermanentDelete={handlePermanentDelete}
                                editingNoteId={editingNoteId}
                                handleUpdateNote={handleUpdateNote}
                                newTitle={newTitle}
                                setNewTitle={setNewTitle}
                                newContent={newContent}
                                setNewContent={setNewContent}
                                newFormat={newFormat}
                                setNewFormat={setNewFormat}
                                newIsPinned={newIsPinned}
                                setNewIsPinned={setNewIsPinned}
                                isTrash={isTrash}
                                onFocusNote={onFocusNote}
                            />
                        ))}
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
});
