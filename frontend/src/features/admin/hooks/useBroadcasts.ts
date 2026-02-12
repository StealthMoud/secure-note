'use client';
import { useState, useEffect, useCallback } from 'react';
import { sendBroadcast, getBroadcasts } from '@/services/adminService';
import { useAdminNotifications } from './useAdminNotifications';
import { Broadcast } from '@/types/admin';

export const useBroadcasts = () => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'alert'>('info');
    const [loading, setLoading] = useState(false);
    const { notifications, addNotification, dismissNotification, cleanup } = useAdminNotifications();
    const [history, setHistory] = useState<Broadcast[]>([]);

    const fetchHistory = useCallback(async () => {
        try {
            const data = await getBroadcasts();
            if (data.broadcasts) {
                setHistory(data.broadcasts);
            }
        } catch (err: any) {
            addNotification('failed to sync transmission history', 'error');
        }
    }, [addNotification]);

    useEffect(() => {
        fetchHistory();
        return () => cleanup();
    }, [fetchHistory, cleanup]);

    const handleSend = async () => {
        if (!message.trim()) {
            addNotification('transmission payload is empty', 'error');
            return;
        }

        setLoading(true);
        try {
            await sendBroadcast({ message, type });
            addNotification('broadcast transmitted successfully', 'success');
            setMessage('');
            fetchHistory();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'transmission failed';
            addNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        message,
        setMessage,
        type,
        setType,
        loading,
        notifications,
        history,
        handleSend,
        dismissNotification
    };
};
