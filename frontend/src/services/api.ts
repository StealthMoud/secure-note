import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const api = axios.create({
    baseURL: `${API_URL}/api`, // Proxy rewrites /api to backend
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// No specific functions here—keep it generic
export default api;