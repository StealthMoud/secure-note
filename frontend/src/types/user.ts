// user related types
export interface User {
    _id: string;
    username: string;
    email: string;
    verified: boolean;
    verificationPending?: boolean;
    verificationRejected?: boolean;
    verificationToken?: string;
    isTotpEnabled?: boolean;
    isActive?: boolean;
    role: 'user' | 'admin' | 'superadmin';
    githubId?: string;
    avatar?: string;
    header?: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    birthday?: string;
    bio?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    country?: string;
    createdAt: string;
    updatedAt: string;
    publicKey?: string;
    friends?: { user: string }[];
    friendRequests?: {
        sender: string;
        receiver: string;
        status: 'pending' | 'accepted' | 'rejected';
        createdAt: string;
        updatedAt: string;
        requestId: string;
    }[];
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
