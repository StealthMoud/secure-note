import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;