'use client';
import { useState, useEffect, useCallback } from 'react';
import {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    shareNote,
    unshareNote,
    getTrash,
    restoreNote,
    permanentlyDeleteNote
} from '@/services/notes';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { useApi } from '@/hooks/useApi';
import jsPDF from 'jspdf';

interface Note {
    _id: string;
    title: string;
    content: string;
    format: 'plain' | 'markdown';
    encrypted: boolean;
    owner: string | { _id: string; username: string };
    createdAt: string;
    sharedWith: { user: { _id: string; username: string }; permission: 'viewer' | 'editor'; encryptedTitle?: string; encryptedContent?: string }[];
    tags: string[];
    isPinned: boolean;
}

export const useNotesLogic = () => {
    const { user } = useDashboardSharedContext();
    const {
        loading,
        error,
        message,
        isExitingError,
        isExitingMessage,
        execute,
        setLoading,
        setError,
        setMessage,
        dismissError,
        dismissMessage
    } = useApi();

    const [notes, setNotes] = useState<Note[]>([]);
    const [trashNotes, setTrashNotes] = useState<Note[]>([]);

    const [createTitle, setCreateTitle] = useState('');
    const [createContent, setCreateContent] = useState('');
    const [createFormat, setCreateFormat] = useState<'plain' | 'markdown'>('plain');
    const [createTags, setCreateTags] = useState<string[]>([]);

    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newFormat, setNewFormat] = useState<'plain' | 'markdown'>('plain');
    const [newTags, setNewTags] = useState<string[]>([]);
    const [newIsPinned, setNewIsPinned] = useState(false);

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [shareTarget, setShareTarget] = useState('');
    const [sharePermission, setSharePermission] = useState<'viewer' | 'editor'>('viewer');

    const [searchQuery, setSearchQuery] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [debouncedTagFilter, setDebouncedTagFilter] = useState('');
    const [showTrash, setShowTrash] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // debounce search and tag filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setDebouncedTagFilter(tagFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, tagFilter]);

    const fetchNotes = useCallback(async () => {
        if (!user) return;
        await execute(async () => {
            const params = { search: debouncedSearchQuery, tag: debouncedTagFilter };
            const notesData = await getNotes(params);
            setNotes(notesData);
        });
    }, [user, debouncedSearchQuery, debouncedTagFilter, execute]);

    const fetchTrash = useCallback(async () => {
        if (!user) return;
        await execute(async () => {
            const trashData = await getTrash();
            setTrashNotes(trashData);
        });
    }, [user, execute]);

    useEffect(() => {
        if (showTrash) fetchTrash();
        else fetchNotes();
    }, [fetchNotes, fetchTrash, showTrash]);

    const handleCreateNote = useCallback(async () => {
        if (!createTitle.trim()) {
            setError('Title is required');
            return;
        }
        if (!user) return;
        if (!user.user.verified && notes.length >= 1) {
            setError('Unverified users can only create one note');
            return;
        }
        if (!user.user.verified && createFormat !== 'plain') {
            setError('Unverified users can only create plain text notes');
            setCreateFormat('plain');
            return;
        }

        await execute(async () => {
            const data = await createNote(createTitle, createContent, createFormat, createTags);
            setNotes([data.note, ...notes]);
            setCreateTitle('');
            setCreateContent('');
            setCreateFormat('plain');
            setCreateTags([]);
            return data;
        }, 'Note created successfully');
    }, [createTitle, createContent, createFormat, createTags, notes, user, execute, setError]);

    const handleEditNote = useCallback(
        (note: Note | null) => {
            if (!note) {
                setEditingNoteId(null);
                setNewTitle('');
                setNewContent('');
                setNewFormat('plain');
                setNewTags([]);
                setNewIsPinned(false);
                return;
            }
            if (!user?.user.verified && note.format !== 'plain') {
                setError('Unverified users can only edit plain text notes');
                return;
            }
            setEditingNoteId(note._id);
            setNewTitle(note.title);
            setNewContent(note.content);
            setNewFormat(note.format);
            setNewTags(note.tags || []);
            setNewIsPinned(note.isPinned || false);
        },
        [user, setError]
    );

    const handleUpdateNote = useCallback(async (isAutosaveParam: any = false) => {
        const isAutosave = isAutosaveParam === true;

        if (!newTitle.trim()) {
            if (!isAutosave) setError('Title is required');
            return;
        }
        if (!editingNoteId || !user) return;
        if (!user.user.verified && newFormat !== 'plain') {
            if (!isAutosave) {
                setError('Unverified users can only update plain text notes');
                setNewFormat('plain');
            }
            return;
        }

        if (isAutosave) {
            setIsSaving(true);
            try {
                const data = await updateNote(editingNoteId, newTitle, newContent, newFormat, newTags, newIsPinned);
                setNotes(notes.map((n) => (n._id === editingNoteId ? data.note : n)));
            } catch (err) {
                console.error('Autosave failed:', err);
            } finally {
                setIsSaving(false);
            }
        } else {
            await execute(async () => {
                const data = await updateNote(editingNoteId, newTitle, newContent, newFormat, newTags, newIsPinned);
                setNotes(notes.map((n) => (n._id === editingNoteId ? data.note : n)));
                setEditingNoteId(null);
                setNewTitle('');
                setNewContent('');
                setNewFormat('plain');
                setNewTags([]);
                setNewIsPinned(false);
                return data;
            }, 'Note updated successfully');
        }
    }, [editingNoteId, newTitle, newContent, newFormat, newTags, newIsPinned, notes, user, execute, setError]);

    useEffect(() => {
        if (!editingNoteId) return;
        const timer = setTimeout(() => {
            handleUpdateNote(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, [newTitle, newContent, editingNoteId, handleUpdateNote]);

    const handleDeleteNote = useCallback(async (noteId: string) => {
        await execute(async () => {
            const data = await deleteNote(noteId);
            setNotes(notes.filter((n) => n._id !== noteId));
            return data;
        }, 'Note moved to trash');
    }, [notes, execute]);

    const handleRestoreNote = useCallback(async (noteId: string) => {
        await execute(async () => {
            const data = await restoreNote(noteId);
            setTrashNotes(trashNotes.filter(n => n._id !== noteId));
            return data;
        }, 'Note restored');
    }, [trashNotes, execute]);

    const handlePermanentDelete = useCallback(async (noteId: string) => {
        if (!confirm('This will delet the note forever. You sure?')) return;
        await execute(async () => {
            const data = await permanentlyDeleteNote(noteId);
            setTrashNotes(trashNotes.filter(n => n._id !== noteId));
            return data;
        }, 'Note permanently deleted');
    }, [trashNotes, execute]);

    const handleShareNote = useCallback(async (noteId: string) => {
        if (!user?.user.verified) {
            setError('Unverified users cannot share notes');
            return;
        }
        if (!shareTarget.trim()) {
            setError('Friend’s username or email is required to share');
            return;
        }
        await execute(async () => {
            const data = await shareNote(noteId, shareTarget, sharePermission);
            setNotes(notes.map((n) => (n._id === noteId ? data.note : n)));
            setShareTarget('');
            setSharePermission('viewer');
            return data;
        }, 'Note shared successfully');
    }, [shareTarget, sharePermission, notes, user, execute, setError]);

    const handleUnshareNote = useCallback(async (noteId: string, targetUserId: string) => {
        if (!user?.user.verified) {
            setError('Unverified users cannot unshare notes');
            return;
        }
        await execute(async () => {
            const data = await unshareNote(noteId, targetUserId);
            setNotes(notes.map((n) => (n._id === noteId ? data.note : n)));
            return data;
        }, 'Note unshared successfully');
    }, [notes, user, execute, setError]);

    const handleExportNote = useCallback(
        (noteId: string, format: 'plain' | 'markdown' | 'pdf') => {
            const note = notes.find((n) => n._id === noteId) || trashNotes.find(n => n._id === noteId);
            if (!note) return;
            if (!user?.user.verified && (format === 'markdown' || format === 'pdf')) {
                setError('Unverified users can only export plain text');
                return;
            }

            if (format === 'plain') {
                const blob = new Blob([note.content], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${note.title}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
            } else if (format === 'markdown') {
                const blob = new Blob([note.content], { type: 'text/markdown' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${note.title}.md`;
                a.click();
                window.URL.revokeObjectURL(url);
            } else if (format === 'pdf') {
                const doc = new jsPDF();
                doc.text(note.title, 10, 10);
                doc.text(note.content, 10, 20);
                doc.save(`${note.title}.pdf`);
            }
        },
        [notes, trashNotes, user, setError]
    );

    const isOwner = useCallback((note: Note, userId: string): boolean => {
        return typeof note.owner === 'string' ? note.owner === userId : note.owner._id === userId;
    }, []);

    return {
        user,
        notes,
        trashNotes,
        showTrash,
        setShowTrash,
        searchQuery,
        setSearchQuery,
        tagFilter,
        setTagFilter,
        createTitle,
        setCreateTitle,
        createContent,
        setCreateContent,
        createFormat,
        setCreateFormat,
        createTags,
        setCreateTags,
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
        isSaving,
        loading,
    };
};
