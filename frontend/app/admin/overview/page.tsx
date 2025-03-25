'use client';
import { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';

// Define the expected response type for the stats API
interface StatsResponse {
    message: string;
    stats: {
        totalUsers: number;
        verifiedUsers: number;
        totalNotes: number;
        pendingVerifications: number;
    };
}

export default function Page() {
    const [stats, setStats] = useState({ totalUsers: 0, verifiedUsers: 0, totalNotes: 0, pendingVerifications: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get<StatsResponse>('/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(response.data.stats); // TypeScript now knows response.data conforms to StatsResponse
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <ChartBarIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Admin Overview
            </h2>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Total Users</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verified Users</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.verifiedUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Total Notes</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.totalNotes}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pending Verifications</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.pendingVerifications}</p>
                </div>
            </div>
        </div>
    );
}