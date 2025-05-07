import api from '@/services/api';
import { User } from './auth';

interface MessageResponse {
    message: string;
}

interface Friend {
    _id: string;
    username: string;
}

interface FriendRequest {
    _id: string;
    sender: { _id: string; username: string };
    receiver: { _id: string; username: string };
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

interface FriendsResponse {
    friends: Friend[];
    friendRequests: FriendRequest[];
}

export const updateProfile = async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        console.log('Sending updateProfile request:', { endpoint: '/users/profile', data, token: token.substring(0, 10) + '...' });
        const response = await api.put<{ message: string; user: User }>('/users/profile', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('updateProfile response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('updateProfile error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            errors: error.response?.data?.errors,
            config: error.config,
            name: error.name,
            stack: error.stack,
        });
        const errorMessage = error.response?.data?.errors
            ? error.response.data.errors.map((err: any) => err.msg).join('; ')
            : error.response?.data?.error || error.message || 'Failed to update profile';
        throw new Error(errorMessage);
    }
};

export const updatePersonalization = async (data: { avatar?: File; header?: File; bio?: string; gender?: string }): Promise<{ message: string; user: User }> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const formData = new FormData();
        if (data.avatar) formData.append('avatar', data.avatar);
        if (data.header) formData.append('header', data.header);
        if (data.bio !== undefined) formData.append('bio', data.bio); // Include bio
        if (data.gender !== undefined) formData.append('gender', data.gender); // Include gender

        console.log('Sending updatePersonalization request:', {
            endpoint: '/users/personalization',
            data: { bio: data.bio, gender: data.gender, hasAvatar: !!data.avatar, hasHeader: !!data.header },
            token: token.substring(0, 10) + '...',
        });
        const response = await api.put<{ message: string; user: User }>('/users/personalization', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('updatePersonalization response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('updatePersonalization error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            errors: error.response?.data?.errors,
            config: error.config,
            name: error.name,
            stack: error.stack,
        });
        const errorMessage = error.response?.data?.errors
            ? error.response.data.errors.map((err: any) => err.msg).join('; ')
            : error.response?.data?.error || error.message || 'Failed to update personalization';
        throw new Error(errorMessage);
    }
};

export const sendFriendRequest = async (target: string): Promise<MessageResponse> => {
    const token = localStorage.getItem('token') || '';
    try {
        const response = await api.post<MessageResponse>('/users/friend/request', { target }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
};

export const respondToFriendRequest = async (
    requestId: string,
    action: 'accept' | 'reject'
): Promise<MessageResponse> => {
    const token = localStorage.getItem('token') || '';
    try {
        const response = await api.post<MessageResponse>('/users/friend/respond', { requestId, action }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
};

export const getFriends = async (): Promise<FriendsResponse> => {
    const token = localStorage.getItem('token') || '';
    try {
        const response = await api.get<FriendsResponse>('/users/friends', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
};