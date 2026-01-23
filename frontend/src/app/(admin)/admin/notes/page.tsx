'use client';
import { useState, useEffect } from 'react';
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';

// define the note interface consistent with your notesLogic.ts
interface Note {
    _id: string;
    title: string;
    content: string;
    owner: { username: string; email: string };
}

// define the response type for the notes api
interface NotesResponse {
    message: string;
    notes: Note[];
    total: number;
    pages: number;
    currentPage: number;
}

// define the response type for delete action
interface NoteActionResponse {
    message: string;
}

export default function Page() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get<NotesResponse>('/admin/notes', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotes(response.data.notes);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load notes');
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const handleDelete = async (noteId: string) => {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                const token = localStorage.getItem('token');
                await api.delete<NoteActionResponse>(`/admin/notes/${noteId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotes(notes.filter((n) => n._id !== noteId));
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to delete note');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <DocumentTextIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Manage Notes
            </h2>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <ul className="space-y-4 mt-6">
                {notes.map((note) => (
                    <li key={note._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <p className="text-gray-900 dark:text-gray-100"><strong>Title:</strong> {note.title}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Owner:</strong> {note.owner.username} ({note.owner.email})</p>
                            <p className="text-gray-600 dark:text-gray-300 break-words"><strong>Content:</strong> {note.content.substring(0, 100)}...</p>
                        </div>
                        <button
                            onClick={() => handleDelete(note._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
                        >
                            <TrashIcon className="w-5 h-5 mr-1" />
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}