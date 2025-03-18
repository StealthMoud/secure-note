'use client';
import { useState, useEffect, useCallback } from 'react';
import { createNote, getNotes, updateNote, deleteNote, shareNote, unshareNote } from '@/services/notes'; // Add unshareNote import
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
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
}

export const useNotesLogic = () => {
    const { user } = useDashboardSharedContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newFormat, setNewFormat] = useState<'plain' | 'markdown'>('plain');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [shareTarget, setShareTarget] = useState('');
    const [sharePermission, setSharePermission] = useState<'viewer' | 'editor'>('viewer');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchNotes = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const notesData = await getNotes();
                setNotes(notesData);
                setError('');
            } catch (err: any) {
                setError(err.message || 'Failed to load notes');
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [user]);

    const handleCreateNote = useCallback(async () => {
        if (!newTitle.trim()) {
            setError('Title is required');
            return;
        }
        if (!user) return;
        if (!user.user.verified && notes.length >= 1) {
            setError('Unverified users can only create one note');
            return;
        }
        if (!user.user.verified && newFormat !== 'plain') {
            setError('Unverified users can only create plain text notes');
            setNewFormat('plain');
            return;
        }
        setLoading(true);
        try {
            const data = await createNote(newTitle, newContent, newFormat);
            setNotes([data.note, ...notes]);
            setNewTitle('');
            setNewContent('');
            setNewFormat('plain');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to create note');
        } finally {
            setLoading(false);
        }
    }, [newTitle, newContent, newFormat, notes, user]);

    const handleEditNote = useCallback((note: Note) => {
        if (!user?.user.verified && note.format !== 'plain') {
            setError('Unverified users can only edit plain text notes');
            return;
        }
        setEditingNoteId(note._id);
        setNewTitle(note.title);
        setNewContent(note.content);
        setNewFormat(note.format);
    }, [user]);

    const handleUpdateNote = useCallback(async () => {
        if (!newTitle.trim()) {
            setError('Title is required');
            return;
        }
        if (!editingNoteId || !user) return;
        if (!user.user.verified && newFormat !== 'plain') {
            setError('Unverified users can only update plain text notes');
            setNewFormat('plain');
            return;
        }
        setLoading(true);
        try {
            const data = await updateNote(editingNoteId, newTitle, newContent, newFormat);
            setNotes(notes.map((n) => (n._id === editingNoteId ? data.note : n)));
            setEditingNoteId(null);
            setNewTitle('');
            setNewContent('');
            setNewFormat('plain');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to update note');
        } finally {
            setLoading(false);
        }
    }, [editingNoteId, newTitle, newContent, newFormat, notes, user]);

    const handleDeleteNote = useCallback(async (noteId: string) => {
        setLoading(true);
        try {
            const data = await deleteNote(noteId);
            setNotes(notes.filter((n) => n._id !== noteId));
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to delete note');
        } finally {
            setLoading(false);
        }
    }, [notes]);

    const handleShareNote = useCallback(async (noteId: string) => {
        if (!user?.user.verified) {
            setError('Unverified users cannot share notes');
            return;
        }
        if (!shareTarget.trim()) {
            setError('Friend’s username or email is required to share');
            return;
        }
        setLoading(true);
        try {
            const data = await shareNote(noteId, shareTarget, sharePermission);
            setNotes(notes.map((n) => (n._id === noteId ? data.note : n)));
            setShareTarget('');
            setSharePermission('viewer');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to share note');
        } finally {
            setLoading(false);
        }
    }, [shareTarget, sharePermission, notes, user]);

    const handleUnshareNote = useCallback(async (noteId: string, targetUserId: string) => {
        if (!user?.user.verified) {
            setError('Unverified users cannot unshare notes');
            return;
        }
        setLoading(true);
        try {
            const data = await unshareNote(noteId, targetUserId);
            setNotes(notes.map((n) => (n._id === noteId ? data.note : n)));
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to unshare note');
        } finally {
            setLoading(false);
        }
    }, [notes, user]);

    const handleExportNote = useCallback((noteId: string, format: 'plain' | 'markdown' | 'pdf') => {
        const note = notes.find((n) => n._id === noteId);
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
    }, [notes, user]);

    const isOwner = useCallback((note: Note, userId: string): boolean => {
        return typeof note.owner === 'string' ? note.owner === userId : note.owner._id === userId;
    }, []);

    return {
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
        handleUnshareNote, // Added to return object
        handleExportNote,
        isOwner,
        message,
        error,
        loading,
    };
};