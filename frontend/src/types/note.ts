// note related types
export interface Note {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    createdBy: string;
    sharedWith: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateNoteData {
    title: string;
    content: string;
    tags?: string[];
}

export interface UpdateNoteData {
    title?: string;
    content?: string;
    tags?: string[];
}
