// user related types
export interface User {
    _id: string;
    username: string;
    email: string;
    verified: boolean;
    role: 'user' | 'admin';
    avatar?: string;
    header?: string;
    nickname?: string;
    bio?: string;
    gender?: string;
    country?: string;
    createdAt: string;
    updatedAt: string;
}

// auth response types
export interface AuthResponse {
    message: string;
    token?: string;
    user?: User;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}
