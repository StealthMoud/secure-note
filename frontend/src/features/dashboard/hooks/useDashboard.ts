'use client';
import { useState, useEffect, useCallback } from 'react';
import { requestVerification } from '@/services/auth';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';

export const useDashboardLogic = () => {
    const { user, setUser } = useDashboardSharedContext();
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleRequestVerification = useCallback(async () => {
        setLoading(true);
        try {
            const data = await requestVerification();
            setMessage(data.message);
            setError('');

            // update global state to reflect pending status immediately
            if (user && setUser) {
                setUser({
                    ...user,
                    user: { ...user.user, verificationPending: true }
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to request verification');
        } finally {
            setLoading(false);
        }
    }, [user, setUser]);

    return {
        user,
        message,
        error,
        loading,
        handleRequestVerification,
        noteCount: useDashboardSharedContext().noteCount,
        friendsCount: useDashboardSharedContext().friendsCount,
    };
};