'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { getUsers, getNoteStats } from '@/services/adminService';
import { SystemStats, StatsResponse, NoteStat } from '@/types/admin';
import { User } from '@/types/user';

export const useAdminOverview = () => {
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        verifiedUsers: 0,
        totalNotes: 0,
        pendingVerifications: 0,
        cpuLoad: 0,
        memoryPercentage: 0,
        memoryUsage: '0 MB',
        uptime: '0s',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dismissedErrorsRef = useRef<Set<string>>(new Set());

    // mock data for visual effects (network remains as visual flair)
    const [networkTraffic, setNetworkTraffic] = useState<number[]>(new Array(20).fill(50));

    // modal states
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [modalData, setModalData] = useState<User[] | NoteStat[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const handleShowUsers = async () => {
        setShowUsersModal(true);
        setModalLoading(true);
        try {
            const data = await getUsers();
            setModalData(data.users);
        } catch (err) {
            setError('failed to load user list');
        } finally {
            setModalLoading(false);
        }
    };

    const handleShowVerified = async () => {
        setShowVerifiedModal(true);
        setModalLoading(true);
        try {
            const data = await getUsers();
            setModalData(data.users.filter((u: User) => u.verified));
        } catch (err) {
            setError('failed to load verified users');
        } finally {
            setModalLoading(false);
        }
    };

    const handleShowNotes = async () => {
        setShowNotesModal(true);
        setModalLoading(true);
        try {
            const data = await getNoteStats();
            setModalData(data.stats);
        } catch (err) {
            setError('failed to load vault stats');
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('no authentication token found');

                const response = await api.get<StatsResponse>('/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(response.data.stats);
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || err.message || 'failed to load stats';
                if (!dismissedErrorsRef.current.has(errorMessage)) {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const pollInterval = setInterval(fetchStats, 10000); // update real stats every 10s

        // simulate network flair
        const flairInterval = setInterval(() => {
            setNetworkTraffic(prev => {
                const newTraffic = [...prev.slice(1), Math.floor(Math.random() * 80) + 20];
                return newTraffic;
            });
        }, 3000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(flairInterval);
        };
    }, []);

    const dismissMessage = () => setError(null);

    return {
        stats,
        loading,
        error,
        networkTraffic,
        showUsersModal,
        setShowUsersModal,
        showVerifiedModal,
        setShowVerifiedModal,
        showNotesModal,
        setShowNotesModal,
        modalData,
        modalLoading,
        handleShowUsers,
        handleShowVerified,
        handleShowNotes,
        dismissMessage
    };
};
