'use client';
import { useState } from 'react';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { updatePersonalization } from '@/services/users';
import { User } from '@/services/auth';

interface UserData {
    user: User;
    role: 'admin' | 'user';
}

export const useProfileLogic = () => {
    const { user, setUser } = useDashboardSharedContext();

    const [avatar, setAvatar] = useState<string | File | undefined>(user?.user.avatar);
    const [header, setHeader] = useState<string | File | undefined>(user?.user.header);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const hasChanges = () => {
        const avatarChanged = avatar instanceof File || (avatar === undefined && user?.user.avatar !== undefined) || (avatar !== user?.user.avatar);
        const headerChanged = header instanceof File || (header === undefined && user?.user.header !== undefined) || (header !== user?.user.header);
        return avatarChanged || headerChanged;
    };

    const handleUpdateAppearance = async () => {
        if (!hasChanges()) {
            console.log('No changes detected in appearance');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const formData = {
                avatar: avatar instanceof File ? avatar : undefined,
                header: header instanceof File ? header : undefined,
            };
            const response = await updatePersonalization(formData);
            console.log('Upload response:', response);
            if (user) {
                const updatedUser: UserData = {
                    ...user,
                    user: {
                        ...user.user,
                        avatar: response.user.avatar,
                        header: response.user.header,
                    },
                };
                setUser(updatedUser);
                console.log('Updated user state:', updatedUser);
            }
            setAvatar(response.user.avatar);
            setHeader(response.user.header);
            console.log('New avatar value:', response.user.avatar);
            setMessage('Appearance updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update appearance');
            console.error('Update appearance error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        throw new Error('User data is not available');
    }

    return {
        user: user.user,
        avatar,
        setAvatar,
        header,
        setHeader,
        handleUpdateAppearance,
        message,
        error,
        loading,
    };
};