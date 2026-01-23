import api from './api';

// user interface with all posible user fields
export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'superadmin' | 'admin' | 'user';
    verified?: boolean;
    verificationPending?: boolean;
    verificationRejected?: boolean;
    verificationToken?: string;
    githubId?: string;
    isTotpEnabled?: boolean;
    isActive?: boolean;
    avatar?: string;
    header?: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    birthday?: string;
    country?: string;
    bio?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    createdAt?: string;
    updatedAt?: string;
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

interface LoginResponse { token?: string; requires2FA?: boolean; tempToken?: string; user: User; }
interface RegisterResponse { message: string; }
interface UserResponse { user: User; role: 'admin' | 'user'; }
interface VerifyEmailResponse { message: string; }
interface UpdateResponse { message: string; user: User; }
interface TotpSetupResponse { message: string; otpauthUrl: string; qrCodeDataURL: string; }
interface TotpResponse { message: string; }
interface TotpLoginResponse { token: string; }

export const registerUser = async (username: string, email: string, password: string, confirmPassword: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', { username, email, password, confirmPassword });
    return response.data;
};

export const loginUser = async (identifier: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { identifier, password });
    return response.data;
};

export const getCurrentUser = async (token: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/me');
    return response.data;
};

export const verifyTotpLogin = async (tempToken: string, totpCode: string): Promise<TotpLoginResponse> => {
    const response = await api.post<TotpLoginResponse>('/auth/verify-totp-login', { tempToken, totpCode });
    return response.data;
};

// redirect to oauth provider for authentcation
export const initiateOAuthLogin = async (provider: 'google' | 'github'): Promise<void> => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/${provider}`;
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
    return response.data;
};

export const requestVerification = async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/request-verification', {});
    return response.data;
};

export const approveVerification = async (userId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/approve-verification', { userId });
    return response.data;
};

export const rejectVerification = async (userId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reject-verification', { userId });
    return response.data;
};

export const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    const response = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
};

export const updateUsername = async (username: string): Promise<{ message: string; user: User }> => {
    const response = await api.put<{ message: string; user: User }>('/users/update-username', { username });
    return response.data;
};

export const changeEmail = async (newEmail: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/users/email', { newEmail });
    return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/users/password', { currentPassword, newPassword });
    return response.data;
};

export const setupTotp = async (): Promise<TotpSetupResponse> => {
    const response = await api.get<TotpSetupResponse>('/totp/setup');
    return response.data;
};

export const verifyTotp = async (token: string): Promise<TotpResponse> => {
    const response = await api.post<TotpResponse>('/totp/verify', { token });
    return response.data;
};

export const disableTotp = async (token?: string): Promise<TotpResponse> => {
    const response = await api.post<TotpResponse>('/totp/disable', { token });
    return response.data;
};