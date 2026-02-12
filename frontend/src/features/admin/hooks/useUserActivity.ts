'use client';
import { useState, useEffect } from 'react';
import { getUserActivity, getSecurityLogs, getBroadcasts } from '@/services/adminService';
import { Activity, Broadcast } from '@/types/admin';
import { SecurityLog } from '@/types/admin';

// hook for fetching and displaying a specific user's activity details
export const useUserActivity = (
    selectedUser: string | null,
    addNotification: (msg: string, type: 'error' | 'success') => void
) => {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [showBroadcastsModal, setShowBroadcastsModal] = useState(false);
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [broadcastsLoading, setBroadcastsLoading] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            setLoading(true);
            setError(null);
            setActivity(null);
            getUserActivity(selectedUser)
                .then(setActivity)
                .catch((err: any) => setError(err.response?.data?.error || 'failed to load activity'))
                .finally(() => setLoading(false));
        } else {
            // reset state when no user is selected
            setActivity(null);
            setLogs([]);
            setBroadcasts([]);
            setError(null);
        }
    }, [selectedUser]);

    const handleShowLogs = async () => {
        if (!selectedUser) return;
        setShowLogsModal(true);
        setLogsLoading(true);
        try {
            const data = await getSecurityLogs({ userId: selectedUser, limit: 50 });
            setLogs(data.logs);
        } catch (err: any) {
            addNotification('failed to load logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    };

    const handleShowBroadcasts = async () => {
        if (!selectedUser) return;
        setShowBroadcastsModal(true);
        setBroadcastsLoading(true);
        try {
            const data = await getBroadcasts(selectedUser);
            setBroadcasts(data.broadcasts);
        } catch (err: any) {
            addNotification('failed to load broadcasts', 'error');
        } finally {
            setBroadcastsLoading(false);
        }
    };

    return {
        activity,
        loading,
        error,
        showLogsModal,
        setShowLogsModal,
        logs,
        logsLoading,
        showBroadcastsModal,
        setShowBroadcastsModal,
        broadcasts,
        broadcastsLoading,
        handleShowLogs,
        handleShowBroadcasts
    };
};
