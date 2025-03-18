'use client';
import { useState } from 'react';

export const useNotificationsLogic = () => {
    // Simulated notification data for a secure note app
    const simulatedNotifications = [
        {
            _id: '1',
            type: 'friend_request',
            message: 'Alice sent you a friend request.',
            timestamp: '2025-03-18T10:00:00Z',
            read: false,
        },
        {
            _id: '2',
            type: 'note_shared',
            message: 'Bob shared a note "Project Plan" with you.',
            timestamp: '2025-03-17T15:30:00Z',
            read: true,
        },
        {
            _id: '3',
            type: 'account',
            message: 'Your email verification was successful.',
            timestamp: '2025-03-16T09:15:00Z',
            read: true,
        },
    ];

    // Local state for notifications
    const [notifications, setNotifications] = useState(simulatedNotifications);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Simulate marking a notification as read
    const handleMarkAsRead = async (id: string) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setMessage('Notification marked as read.');
        } catch (err) {
            setError('Failed to mark notification as read.');
        } finally {
            setLoading(false);
        }
    };

    // Simulate clearing all notifications
    const handleClearAll = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setNotifications([]);
            setMessage('All notifications cleared.');
        } catch (err) {
            setError('Failed to clear notifications.');
        } finally {
            setLoading(false);
        }
    };

    // Notification stats
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        unreadCount,
        handleMarkAsRead,
        handleClearAll,
        message,
        error,
        loading,
    };
};