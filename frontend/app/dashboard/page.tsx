'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser, requestVerification } from '@/services/auth';
import { createNote, getNotes, updateNote, deleteNote } from '@/services/notes';

interface UserData {
    user: {
        _id: string;
        username: string;
        email: string;
        role: string;
        verified?: boolean;
    };
    role: string;
}

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
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
                } catch (error) {
                    console.error('Failed to fetch data:', error);
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
            setError(err.message);
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
            setError(err.message);
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
            setError(err.message);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            const data = await deleteNote(noteId);
            setNotes(notes.filter((n) => n._id !== noteId));
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
                {user ? (
                    <>
                        <p className="mb-4">Welcome, {user.user.username}!</p>
                        {user.user.verified ? (
                            <div className="border p-4 rounded">
                                <h2 className="text-xl font-semibold mb-2">Your Notes</h2>
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Note title"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Write a new note..."
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <button
                                    onClick={editingNoteId ? handleUpdateNote : handleCreateNote}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {editingNoteId ? 'Update Note' : 'Add Note'}
                                </button>
                                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                {notes.length > 0 ? (
                                    <ul className="mt-4 space-y-2">
                                        {notes.map((note) => (
                                            <li key={note._id} className="border p-2 rounded flex justify-between items-center">
                                                <div>
                                                    <strong>{note.title}</strong>: {note.content}
                                                    <span className="text-gray-500 text-sm"> ({new Date(note.createdAt).toLocaleString()})</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => handleEditNote(note)}
                                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note._id)}
                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 mt-2">No notes yet.</p>
                                )}
                            </div>
                        ) : (
                            <div className="border p-4 rounded bg-yellow-100">
                                <p className="mb-2 text-yellow-800">Your email is not verified. Limited access (1 note max).</p>
                                <button
                                    onClick={handleRequestVerification}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Request Verification
                                </button>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                                {notes.length === 0 && (
                                    <div className="mt-4">
                                        <h2 className="text-xl font-semibold mb-2">Create Your Note</h2>
                                        <input
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="Note title"
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                        <textarea
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            placeholder="Write your note (1 note max)..."
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                        <button
                                            onClick={handleCreateNote}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                )}
                                {notes.length > 0 && (
                                    <div className="mt-4">
                                        <h2 className="text-xl font-semibold mb-2">Your Notes (Read-Only)</h2>
                                        <ul className="space-y-2">
                                            {notes.map((note) => (
                                                <li key={note._id} className="border p-2 rounded">
                                                    <strong>{note.title}</strong>: {note.content}
                                                    <span className="text-gray-500 text-sm"> ({new Date(note.createdAt).toLocaleString()})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <p>Unable to load user data.</p>
                )}
            </div>
        </ProtectedRoute>
    );
}