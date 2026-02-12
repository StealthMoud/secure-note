'use client';
import { useState, useCallback, useRef } from 'react';
import { Notification } from '@/types/notification';

// shared hook that handles toast-style notifications for admin panels
// extracts the duplicated addNotification/dismissNotification pattern
export const useAdminNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const addNotification = useCallback((message: string, type: 'error' | 'success' = 'success') => {
        const id = `${Date.now()}-${Math.random()}`;
        setNotifications(prev => [...prev, { id, message, type, isExiting: false }]);
        const timeout = setTimeout(() => dismissNotification(id), 5000);
        notificationTimeoutRef.current.set(id, timeout);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isExiting: true } : n)));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            notificationTimeoutRef.current.delete(id);
        }, 300);
    }, []);

    const cleanup = useCallback(() => {
        notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
        notificationTimeoutRef.current.clear();
    }, []);

    return {
        notifications,
        addNotification,
        dismissNotification,
        cleanup,
    };
};
