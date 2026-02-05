import api from '@/services/api';
import { User } from '@/services/auth';

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

// update user profile fields like name birthday country
export const updateProfile = async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put<{ message: string; user: User }>('/users/update-profile', data);
    return response.data;
};

// update personalizaton with avatar header bio and gender using formdata for file uploads
export const updatePersonalization = async (data: { avatar?: File; header?: File; bio?: string; gender?: string }): Promise<{ message: string; user: User }> => {
    const formData = new FormData();
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.header) formData.append('header', data.header);
    if (data.bio !== undefined) formData.append('bio', data.bio);
    if (data.gender !== undefined) formData.append('gender', data.gender);

    const response = await api.put<{ message: string; user: User }>('/users/personalization', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const sendFriendRequest = async (target: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/users/friend/request', { target });
    return response.data;
};

export const respondToFriendRequest = async (
    requestId: string,
    action: 'accept' | 'reject'
): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/users/friend/respond', { requestId, action });
    return response.data;
};

export const getFriends = async (): Promise<FriendsResponse> => {
    const response = await api.get<FriendsResponse>('/users/friends');
    return response.data;
};

export const deleteAccount = async (password?: string): Promise<MessageResponse> => {
    const response = await (api as any).delete('/users/me', {
        data: { password }
    });
    return response.data;
};