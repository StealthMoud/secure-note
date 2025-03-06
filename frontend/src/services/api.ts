import axios from 'axios';

// Base URL of backend
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002/';

// Axios instance with default settings
export const api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Example: User Login API Call
export const loginUser = async (email: string, password: string) => {
    try {
        const response = await api.post('api/auth/login', { email, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};
