export interface Note {
    _id: string;
    title: string;
    content: string;
    format: 'plain' | 'markdown';
    encrypted: boolean;
    owner: string | { _id: string; username: string };
    createdAt: string;
    sharedWith: {
        user: { _id: string; username: string };
        permission: 'viewer' | 'editor';
        encryptedContent?: string;
    }[];
    tags: string[];
    isPinned: boolean;
}
