import api from './api';

// note interface with all fields including encryption and sharing
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

interface NotesResponse {
    message: string;
    notes: Note[];
}

export const createNote = async (title: string, content: string, format: 'plain' | 'markdown', tags: string[] = [], isPinned: boolean = false): Promise<{ message: string; note: Note }> => {
    const response = await api.post<{ message: string; note: Note }>('/notes', { title, content, format, tags, isPinned });
    return response.data;
};

// get notes with filters for searchin and tagging
export const getNotes = async (params: { search?: string; tag?: string; isPinned?: boolean } = {}): Promise<Note[]> => {
    const response = await api.get<NotesResponse>('/notes', { params });
    return response.data.notes;
};

export const updateNote = async (noteId: string, title: string, content: string, format: 'plain' | 'markdown', tags: string[] = [], isPinned: boolean = false): Promise<{ message: string; note: Note }> => {
    const response = await api.put<{ message: string; note: Note }>(`/notes/${noteId}`, { title, content, format, tags, isPinned });
    return response.data;
};

export const deleteNote = async (noteId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notes/${noteId}`);
    return response.data;
};

export const shareNote = async (noteId: string, target: string, permission: 'viewer' | 'editor'): Promise<{ message: string; note: Note }> => {
    const response = await api.post<{ message: string; note: Note }>(`/notes/${noteId}/share`, { target, permission });
    return response.data;
};

export const unshareNote = async (noteId: string, targetUserId: string): Promise<{ message: string; note: Note }> => {
    const response = await api.post<{ message: string; note: Note }>('/notes/unshare', { noteId, targetUserId });
    return response.data;
};

// get notes in trash
export const getTrash = async (): Promise<Note[]> => {
    const response = await api.get<NotesResponse>('/notes/trash/all');
    return response.data.notes;
};

// restor a note from trash
export const restoreNote = async (noteId: string): Promise<{ message: string; note: Note }> => {
    const response = await api.post<{ message: string; note: Note }>(`/notes/${noteId}/restore`, {});
    return response.data;
};

// delte note forever
export const permanentlyDeleteNote = async (noteId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notes/${noteId}/permanent`);
    return response.data;
};
