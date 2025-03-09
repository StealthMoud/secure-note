import api from './api';

interface Note {
    _id: string;
    title: string;
    content: string;
    format: 'plain' | 'markdown';
    encrypted: boolean;
    owner: string;
    createdAt: string;
}

interface NotesResponse {
    message: string;
    notes: Note[];
}

export const createNote = async (title: string, content: string, encrypted: boolean = false): Promise<{ message: string; note: Note }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post<{ message: string; note: Note }>('/notes', { title, content, encrypted }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create note');
    }
};

export const getNotes = async (): Promise<Note[]> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get<NotesResponse>('/notes', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.notes;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch notes');
    }
};

export const updateNote = async (noteId: string, title: string, content: string, encrypted: boolean = false): Promise<{ message: string; note: Note }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.put<{ message: string; note: Note }>(`/notes/${noteId}`, { title, content, encrypted }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update note');
    }
};

export const deleteNote = async (noteId: string): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.delete<{ message: string }>(`/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete note');
    }
};