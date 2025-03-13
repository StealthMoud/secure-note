import api from './api';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

interface RegisterResponse {
    message: string;
}

interface UserResponse {
    user: User;
    role: string;
}

interface VerifyEmailResponse {
    message: string;
}


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
        const response = await api.post<LoginResponse>('/auth/login', {identifier, password});
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

// Verify Email
export const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    try {
        const response = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
        return response.data; // Typed as VerifyEmailResponse
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Email verification failed');
    }
};

// Get Current User
export const getCurrentUser = async (token: string): Promise<UserResponse> => {
    try {
        const response = await api.get<UserResponse>('/users/me', {
            headers: {Authorization: `Bearer ${token}`},
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
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to request verification');
    }
};

export const approveVerification = async (userId: string): Promise<{ message: string }> => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post<{ message: string }>('/auth/approve-verification', {userId}, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to approve verification');
    }
};