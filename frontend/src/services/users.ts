import api from '@/services/api';

const getToken = () => localStorage.getItem('token') || '';

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

export const sendFriendRequest = async (target: string): Promise<MessageResponse> => {
    const token = getToken();
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
    const token = getToken();
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
    const token = getToken();
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