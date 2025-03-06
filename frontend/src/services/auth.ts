import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002/api';

// Register User
export const registerUser = async (name: string, email: string, password: string) => {
    return axios.post(`${API_URL}/auth/register`, {name, email, password});
};

// Login User
export const loginUser = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
};

// Get Current User
export const getCurrentUser = async (token: string) => {
    const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
