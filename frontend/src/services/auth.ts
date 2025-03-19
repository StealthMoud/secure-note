import api from './api';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    birthday?: string;
    country?: string;
    bio?: string;
    gender?: string;
    avatar?: string;
    header?: string;
    verified?: boolean;
    githubId?: string;
    isTotpEnabled?: boolean;
}

interface LoginResponse {
    token?: string;
    requires2FA?: boolean;
    tempToken?: string;
    user: User;
}
interface RegisterResponse { message: string; }
interface UserResponse { user: User; role: string; }
interface VerifyEmailResponse { message: string; }
interface UpdateResponse { message: string; user: User; }
interface TotpSetupResponse { message: string; otpauthUrl: string; qrCodeDataURL: string; }
interface TotpResponse { message: string; }
interface TotpLoginResponse { token: string; }

export const registerUser = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<RegisterResponse> => {
    try {
        const response = await api.post<RegisterResponse>('/auth/register', {
            username,
            email,
            password,
            confirmPassword,
        });
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

// Other functions remain unchanged
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

export const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    try {
        const response = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Email verification failed');
    }
};

export const updateProfile = async (data: Partial<User>): Promise<UpdateResponse> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.put<UpdateResponse>('/users/profile', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
};

export const updatePersonalization = async (data: Partial<User> & { avatar?: File, header?: File }): Promise<UpdateResponse> => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        if (data.avatar) formData.append('avatar', data.avatar);
        if (data.header) formData.append('header', data.header);
        if (data.bio) formData.append('bio', data.bio);
        if (data.gender) formData.append('gender', data.gender);

        const response = await api.put<UpdateResponse>('/users/personalization', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update personalization');
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