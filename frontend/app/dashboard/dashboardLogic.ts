'use client';
import { useState, useEffect, useCallback } from 'react';
import { requestVerification } from '@/services/auth';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

export const useDashboardLogic = () => {
    const { user } = useDashboardSharedContext();
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleRequestVerification = useCallback(async () => {
        setLoading(true);
        try {
            const data = await requestVerification();
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to request verification');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        user,
        message,
        error,
        loading,
        handleRequestVerification,
    };
};