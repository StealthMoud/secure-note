'use client';
import { useState, useEffect, useCallback } from 'react';
import { createNote, getNotes, updateNote, deleteNote, shareNote } from '@/services/notes';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

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

export const useNotesLogic = () => {
    const { user } = useDashboardSharedContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [shareUserId, setShareUserId] = useState('');
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
        setLoading(true);
        try {
            const data = await createNote(newTitle, newContent);
            setNotes([data.note, ...notes]);
            setNewTitle('');
            setNewContent('');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to create note');
        } finally {
            setLoading(false);
        }
    }, [newTitle, newContent, notes]);

    const handleEditNote = useCallback((note: Note) => {
        setEditingNoteId(note._id);
        setNewTitle(note.title);
        setNewContent(note.content);
    }, []);

    const handleUpdateNote = useCallback(async () => {
        if (!newTitle.trim()) {
            setError('Title is required');
            return;
        }
        if (!editingNoteId) return;
        setLoading(true);
        try {
            const data = await updateNote(editingNoteId, newTitle, newContent);
            setNotes(notes.map((n) => (n._id === editingNoteId ? data.note : n)));
            setEditingNoteId(null);
            setNewTitle('');
            setNewContent('');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to update note');
        } finally {
            setLoading(false);
        }
    }, [editingNoteId, newTitle, newContent, notes]);

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
        if (!shareUserId.trim()) {
            setError('User ID is required to share');
            return;
        }
        setLoading(true);
        try {
            const data = await shareNote(noteId, shareUserId, sharePermission);
            setNotes(notes.map((n) => (n._id === noteId ? data.note : n)));
            setShareUserId('');
            setSharePermission('viewer');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to share note');
        } finally {
            setLoading(false);
        }
    }, [shareUserId, sharePermission, notes]);

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
    };
};