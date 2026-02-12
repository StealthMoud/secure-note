'use client';

import React, { useState, useEffect } from 'react';
import {
    PencilIcon,
    TrashIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { useNotesLogic } from '@/features/notes/hooks/useNotes';
import { NoteInputForm } from '@/components/notes/NoteInputForm';
import { NotesList } from '@/components/notes/NotesList';
import { NotesHeader } from '@/components/notes/NotesHeader';
import { FocusedNoteModal } from '@/components/notes/FocusedNoteModal';
import { FeedbackToasts } from '@/components/ui';
import { Note } from '@/types/note';
import { getTagColor } from '@/utils/tagColors';
import { LockClosedIcon } from '@heroicons/react/24/outline';

// configure marked for synchronous parseing
import { marked } from 'marked';
marked.setOptions({ async: false });

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
        { name: 'owned', label: 'My Vault', icon: PencilIcon }, // using PencilIcon for consistency with design
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
            <NotesHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                tagFilter={tagFilter}
                setTagFilter={setTagFilter}
            />

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

            {/* new cool stuff */}
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
                <FocusedNoteModal
                    focusedNote={focusedNote}
                    setFocusedNote={setFocusedNote}
                />
            )}

            {/* Premium Toast Notifications */}
            <FeedbackToasts
                error={error}
                message={message}
                isExitingError={isExitingError}
                isExitingMessage={isExitingMessage}
                dismissError={dismissError}
                dismissMessage={dismissMessage}
            />

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