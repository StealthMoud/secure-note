import api from './api';
import { User } from '@/types/user';
import { Activity } from '@/types/admin';

// create new user or admin acount from admin panel
export const createUser = async (data: { username: string; email: string; password: string; role: 'user' | 'admin' }) => {
    const response = await api.post<{ message: string; user: User }>('/admin/users', data);
    return response.data;
};

// update user role
export const updateUserRole = async (userId: string, role: string) => {
    const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/role`, { role });
    return response.data;
};

// get all users with optional filtering
export const getUsers = async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; filter?: string; pendingOnly?: boolean }) => {
    const response = await api.get<{ message: string; users: User[]; total: number; pages: number; currentPage: number }>('/admin/users', { params });
    return response.data;
};

export const unverifyUser = async (userId: string) => {
    const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/unverify`, {});
    return response.data;
};

export const verifyUser = async (userId: string) => {
    const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/verify`, {});
    return response.data;
};

export const deleteUser = async (userId: string) => {
    const response = await api.delete<{ message: string }>(`/admin/users/${userId}`);
    return response.data;
};

// get user activity stats for admin monitoring
export const getUserActivity = async (userId: string) => {
    const response = await api.get<{ message: string; activity: Activity }>(`/admin/users/${userId}/activity`);
    return response.data.activity;
};

// do multiple things at once to users
export const bulkUserAction = async (userIds: string[], action: 'verify' | 'delete' | 'unverify') => {
    const response = await api.post<{ message: string }>('/admin/bulk-action', { userIds, action });
    return response.data;
};

export const bulkDeleteUsers = async (userIds: string[]) => {
    return bulkUserAction(userIds, 'delete');
};

export const bulkVerifyUsers = async (userIds: string[]) => {
    return bulkUserAction(userIds, 'verify');
};

// get system stats for overview
export const getSystemStats = async () => {
    const response = await api.get<{ message: string; stats: any }>('/admin/stats');
    return response.data.stats;
};

// send system broadcast
export const sendBroadcast = async (data: { message: string; type: 'info' | 'warning' | 'alert' }) => {
    const response = await api.post<{ message: string }>('/admin/broadcast', data);
    return response.data;
};

// get detailed note statistics
export const getNoteStats = async () => {
    const response = await api.get<{ stats: any[] }>('/admin/note-stats');
    return response.data;
};

// get security logs
export const getSecurityLogs = async (params: { page?: number; limit?: number; severity?: string; userId?: string }) => {
    const response = await api.get<{ message: string; logs: any[]; total: number }>('/admin/logs', { params });
    return response.data;
};

// get all broadcasts history
export const getBroadcasts = async (userId?: string) => {
    const response = await api.get<{ broadcasts: any[] }>('/admin/broadcasts', { params: { userId } });
    return response.data;
};

