// /frontend/src/services/adminService.ts
import api from './api';

interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    verified: boolean;
    isActive: boolean;
    createdAt: string;
}

interface Activity {
    notesCreated: number;
    friendsAdded: number;
    sharedWith: string[];
}

export const createUser = async (data: { username: string; email: string; password: string; role: 'user' | 'admin' }) => {
    const token = localStorage.getItem('token');
    const response = await api.post<{ message: string; user: User }>('/admin/users', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const unverifyUser = async (userId: string) => {
    const token = localStorage.getItem('token');
    const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/unverify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getUserActivity = async (userId: string) => {
    const token = localStorage.getItem('token');
    const response = await api.get<{ message: string; activity: Activity }>(`/admin/users/${userId}/activity`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.activity;
};