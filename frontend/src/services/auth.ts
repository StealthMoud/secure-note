import api from './api';

export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    verified?: boolean;
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
interface UserResponse { user: User; role: string; }
interface VerifyEmailResponse { message: string; }
interface UpdateResponse { message: string; user: User; }
interface TotpSetupResponse { message: string; otpauthUrl: string; qrCodeDataURL: string; }
interface TotpResponse { message: string; }
interface TotpLoginResponse { token: string; }

export const registerUser = async (username: string, email: string, password: string, confirmPassword: string): Promise<RegisterResponse> => {
    try {
        const response = await api.post<RegisterResponse>('/auth/register', { username, email, password, confirmPassword });
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.errors) {
            const fieldErrors: Record<string, string> = {};
            error.response.data.errors.forEach((err: any) => {
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw { fieldErrors };
        }
        throw new Error(error.response?.data?.error || 'Registration failed');
    }
};

export const loginUser = async (identifier: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/auth/login', { identifier, password });
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.errors) {
            const fieldErrors: Record<string, string> = {};
            error.response.data.errors.forEach((err: any) => {
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw { fieldErrors };
        }
        throw new Error(error.response?.data?.error || 'Login failed');
    }
};

export const getCurrentUser = async (token: string): Promise<UserResponse> => {
    try {
        const response = await api.get<UserResponse>('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
};

export const verifyTotpLogin = async (tempToken: string, totpCode: string): Promise<TotpLoginResponse> => {
    try {
        const response = await api.post<TotpLoginResponse>('/auth/verify-totp-login', { tempToken, totpCode });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to verify 2FA code');
    }
};

export const initiateOAuthLogin = async (provider: 'google' | 'github'): Promise<void> => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/${provider}`;
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>('/auth/request-password-reset', { email });
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.errors) {
            const fieldErrors: Record<string, string> = {};
            error.response.data.errors.forEach((err: any) => {
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw { fieldErrors };
        }
        throw new Error(error.response?.data?.error || 'Failed to request password reset');
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.errors) {
            const fieldErrors: Record<string, string> = {};
            error.response.data.errors.forEach((err: any) => {
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw { fieldErrors };
        }
        throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
};

export const requestVerification = async (): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post<{ message: string }>('/auth/request-verification', {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to request verification');
    }
};

export const approveVerification = async (userId: string): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post<{ message: string }>('/auth/approve-verification', { userId }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to approve verification');
    }
};

export const rejectVerification = async (userId: string): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post<{ message: string }>('/auth/reject-verification', { userId }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to reject verification');
    }
};

export const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    try {
        const response = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Email verification failed');
    }
};

export const updateUsername = async (username: string): Promise<{ message: string; user: User }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.put<{ message: string; user: User }>('/users/username', { username }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update username');
    }
};

export const changeEmail = async (newEmail: string): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.put<{ message: string }>('/users/email', { newEmail }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to change email');
    }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.put<{ message: string }>('/users/password', { currentPassword, newPassword }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to change password');
    }
};

export const setupTotp = async (): Promise<TotpSetupResponse> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get<TotpSetupResponse>('/totp/setup', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to setup TOTP');
    }
};

export const verifyTotp = async (token: string): Promise<TotpResponse> => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await api.post<TotpResponse>('/totp/verify', { token }, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to verify TOTP');
    }
};

export const disableTotp = async (token?: string): Promise<TotpResponse> => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await api.post<TotpResponse>('/totp/disable', { token }, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to disable TOTP');
    }
};