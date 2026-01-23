'use client';
import { useState, useEffect } from 'react';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { updatePersonalization } from '@/services/users';
import { User } from '@/services/auth';

interface UserData {
    user: User;
    role: 'superadmin' | 'admin' | 'user';
}

export const useProfileLogic = () => {
    const { user, setUser } = useDashboardSharedContext();

    const [avatar, setAvatar] = useState<string | File | undefined>(user?.user.avatar);
    const [header, setHeader] = useState<string | File | undefined>(user?.user.header);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const hasChanges = () => {
        const avatarChanged =
            avatar instanceof File ||
            (avatar === undefined && user?.user.avatar !== undefined) ||
            (avatar !== user?.user.avatar);
        const headerChanged =
            header instanceof File ||
            (header === undefined && user?.user.header !== undefined) ||
            (header !== user?.user.header);
        return avatarChanged || headerChanged;
    };

    const dismissMessage = (type: 'error' | 'message') => {
        if (type === 'error') {
            setIsExitingError(true);
            setTimeout(() => {
                setError(null);
                setIsExitingError(false);
            }, 500); // Match transition duration
        } else {
            setIsExitingMessage(true);
            setTimeout(() => {
                setMessage(null);
                setIsExitingMessage(false);
            }, 500); // Match transition duration
        }
    };

    const handleUpdateAppearance = async () => {
        if (!hasChanges()) {
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
            }
            setAvatar(response.user.avatar);
            setHeader(response.user.header);
            setMessage('Appearance updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update appearance');
            console.error('Update appearance error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let errorTimeout: NodeJS.Timeout;
        let messageTimeout: NodeJS.Timeout;

        if (error) {
            errorTimeout = setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => {
                    setError(null);
                    setIsExitingError(false);
                }, 500); // Match transition duration
            }, 5000); // Display for 5 seconds
        }

        if (message) {
            messageTimeout = setTimeout(() => {
                setIsExitingMessage(true);
                setTimeout(() => {
                    setMessage(null);
                    setIsExitingMessage(false);
                }, 500); // Match transition duration
            }, 5000); // Display for 5 seconds
        }

        return () => {
            clearTimeout(errorTimeout);
            clearTimeout(messageTimeout);
        };
    }, [error, message]);

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
        isExitingError,
        isExitingMessage,
        dismissMessage,
        loading,
        hasChanges, // Added to return object
    };
};