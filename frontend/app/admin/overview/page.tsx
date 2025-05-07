'use client';
import { useState, useEffect, useRef } from 'react';
import { ChartBarIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        totalNotes: 0,
        pendingVerifications: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExitingError, setIsExitingError] = useState(false);
    const dismissedErrorsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                console.log('Fetching admin stats:', { endpoint: '/admin/stats', token: token.substring(0, 10) + '...' });
                const response = await api.get<StatsResponse>('/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Admin stats response:', response.data);
                setStats(response.data.stats);
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || err.message || 'Failed to load stats';
                console.error('Fetch stats error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    config: err.config,
                });
                if (!dismissedErrorsRef.current.has(errorMessage)) {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const dismissMessage = () => {
        if (error) {
            setIsExitingError(true);
            dismissedErrorsRef.current.add(error);
            setTimeout(() => {
                setError(null);
                setIsExitingError(false);
            }, 500); // Match transition duration
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <svg
                    className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Loading stats...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fadeInShort">
            <style jsx>{`
                @keyframes fadeInShort {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeInShort {
                    animation: fadeInShort 0.5s ease-out;
                }
                @keyframes fadeInCard {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeInCard {
                    animation: fadeInCard 0.6s ease-out forwards;
                }
                .animate-fadeInCard:nth-child(1) {
                    animation-delay: 0.1s;
                }
                .animate-fadeInCard:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .animate-fadeInCard:nth-child(3) {
                    animation-delay: 0.3s;
                }
                .animate-fadeInCard:nth-child(4) {
                    animation-delay: 0.4s;
                }
            `}</style>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <ChartBarIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300 animate-pulse" />
                Admin Overview
            </h2>
            {error && (
                <p
                    className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-3 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingError ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                    {error}
                    <button
                        onClick={dismissMessage}
                        className="ml-auto focus:outline-none"
                        aria-label="Dismiss error"
                    >
                        <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                    </button>
                </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInCard"
                >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Total Users</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.totalUsers}</p>
                </div>
                <div
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInCard"
                >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verified Users</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.verifiedUsers}</p>
                </div>
                <div
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInCard"
                >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Total Notes</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.totalNotes}</p>
                </div>
                <div
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInCard"
                >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pending Verifications</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-2xl">{stats.pendingVerifications}</p>
                </div>
            </div>
        </div>
    );
}