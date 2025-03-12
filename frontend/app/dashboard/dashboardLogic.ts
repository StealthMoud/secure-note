'use client';
import { useState, useEffect } from 'react';
import { getCurrentUser, requestVerification } from '@/services/auth';
import { createNote, getNotes, updateNote, deleteNote, shareNote } from '@/services/notes';
import { getFriends, sendFriendRequest, respondToFriendRequest } from '@/services/users';

interface UserData {
    user: { _id: string; username: string; email: string; role: string; verified?: boolean };
    role: string;
}

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

interface Friend {
    _id: string;
    username: string;
}

interface FriendRequest {
    _id: string;
    sender: { _id: string; username: string };
    receiver: { _id: string; username: string };
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export const useDashboardLogic = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [shareUserId, setShareUserId] = useState('');
    const [sharePermission, setSharePermission] = useState<'viewer' | 'editor'>('viewer');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friendRequestUsername, setFriendRequestUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await getCurrentUser(token);
                    setUser(data);
                    if (data.role === 'admin') {
                        window.location.href = '/admin/verify';
                        return;
                    }
                    const notesData = await getNotes();
                    setNotes(notesData);
                    const friendsData = await getFriends();
                    setFriends(friendsData.friends);
                    setFriendRequests(friendsData.friendRequests);
                } catch (error: any) {
                    console.error('Failed to fetch data:', error);
                    setError(error.message || 'Failed to load data');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleRequestVerification = async () => {
        try {
            const data = await requestVerification();
            setMessage(data.message);
        } catch (err: any) {
            setError(err.message || 'Failed to request verification');
        }
    };

    const handleCreateNote = async () => {
        if (!newTitle.trim()) {
            setError('Title is required');
            return;
        }
        try {
            const data = await createNote(newTitle, newContent);
            setNotes([data.note, ...notes]);
            setNewTitle('');
            setNewContent('');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to create note');
        }
    };

    const handleEditNote = (note: Note) => {
        setEditingNoteId(note._id);
        setNewTitle(note.title);
        setNewContent(note.content);
    };

    const handleUpdateNote = async () => {
        if (!newTitle.trim()) {
            setError('Title is required');
            return;
        }
        if (!editingNoteId) return;
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
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            const data = await deleteNote(noteId);
            setNotes(notes.filter((n) => n._id !== noteId));
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to delete note');
        }
    };

    const handleShareNote = async (noteId: string) => {
        if (!shareUserId.trim()) {
            setError('User ID is required to share');
            return;
        }
        try {
            const data = await shareNote(noteId, shareUserId, sharePermission);
            setNotes(notes.map((n) => (n._id === noteId ? data.note : n)));
            setShareUserId('');
            setSharePermission('viewer');
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to share note');
        }
    };

    const handleSendFriendRequest = async () => {
        if (!friendRequestUsername.trim()) {
            setError('Username is required to send a friend request');
            return;
        }
        try {
            const data = await sendFriendRequest(friendRequestUsername);
            setFriendRequestUsername('');
            setMessage(data.message);
            setError('');
            const friendsData = await getFriends();
            setFriends(friendsData.friends);
            setFriendRequests(friendsData.friendRequests);
        } catch (err: any) {
            setError(err.message || 'Failed to send friend request');
        }
    };

    const handleRespondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            const data = await respondToFriendRequest(requestId, action);
            setMessage(data.message);
            setError('');
            const friendsData = await getFriends();
            setFriends(friendsData.friends);
            setFriendRequests(friendsData.friendRequests);
        } catch (err: any) {
            // Extract backend error message if available, otherwise fallback to generic message
            const errorMessage = err.response?.data?.error || err.message || 'Failed to respond to friend request';
            setError(errorMessage);
        }
    };


    const isOwner = (note: Note, userId: string): boolean => {
        return typeof note.owner === 'string' ? note.owner === userId : note.owner._id === userId;
    };

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
        friends,
        friendRequests,
        friendRequestUsername,
        setFriendRequestUsername,
        loading,
        message,
        error,
        handleLogout,
        handleRequestVerification,
        handleCreateNote,
        handleEditNote,
        handleUpdateNote,
        handleDeleteNote,
        handleShareNote,
        handleSendFriendRequest,
        handleRespondToFriendRequest,
        isOwner,
    };
};