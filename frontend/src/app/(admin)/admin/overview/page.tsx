'use client';
import { useState, useEffect, useRef } from 'react';
import {
    ChartBarIcon,
    XCircleIcon,
    XMarkIcon,
    HeartIcon,
    ShieldCheckIcon,
    ServerIcon,
    GlobeAmericasIcon,
    CpuChipIcon,
    WifiIcon,
    LockClosedIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '@/services/api';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { getUsers, getNoteStats } from '@/services/adminService';

// define the expected response type for the stats api
interface StatsResponse {
    message: string;
    stats: {
        totalUsers: number;
        verifiedUsers: number;
        totalNotes: number;
        pendingVerifications: number;
        cpuLoad: number;
        memoryPercentage: number;
        memoryUsage: string;
        uptime: string;
    };
}

export default function Page() {
    const { user } = useDashboardSharedContext();
    const [stats, setStats] = useState({
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

    // Mock data for visual effects (Network remains as visual flair)
    const [networkTraffic, setNetworkTraffic] = useState<number[]>(new Array(20).fill(50));

    // Modal States
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const handleShowUsers = async () => {
        setShowUsersModal(true);
        setModalLoading(true);
        try {
            const data = await getUsers();
            setModalData(data.users);
        } catch (err) {
            setError('Failed to load user list');
        } finally {
            setModalLoading(false);
        }
    };

    const handleShowVerified = async () => {
        setShowVerifiedModal(true);
        setModalLoading(true);
        try {
            const data = await getUsers();
            setModalData(data.users.filter((u: any) => u.verified));
        } catch (err) {
            setError('Failed to load verified users');
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
            setError('Failed to load vault stats');
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const response = await api.get<StatsResponse>('/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(response.data.stats);
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || err.message || 'Failed to load stats';
                if (!dismissedErrorsRef.current.has(errorMessage)) {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const pollInterval = setInterval(fetchStats, 10000); // Update real stats every 10s

        // Simulate network flair
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10 opacity-20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 rounded-full bg-blue-500/20 animate-pulse"></div>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Initializing Core...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeInShort">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">
                        Command<span className="text-blue-600">Center</span>
                    </h2>
                    <p className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                        System Operational • Node v2.1.0
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Security Status Card */}
                    <div
                        onClick={() => window.location.href = '/admin/settings'}
                        className={`flex items-center gap-4 p-4 rounded-2xl glass border-l-4 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 ${user?.user.isTotpEnabled ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10'}`}
                        title={user?.user.isTotpEnabled ? 'Security active' : 'Click to enhance protection'}
                    >
                        <div className={`p-2 rounded-xl ${user?.user.isTotpEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
                            <ShieldCheckIcon className={`w-6 h-6 ${user?.user.isTotpEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${user?.user.isTotpEnabled ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-amber-600/70 dark:text-amber-400/70'}`}>Security Status</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{user?.user.isTotpEnabled ? 'ENHANCED' : 'BASIC'}</p>
                        </div>
                    </div>

                    {/* Admin Profile Chip */}
                    {user && (
                        <div className="pl-1 pr-6 py-1 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/30">
                                {user.user.username[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.user.username}</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-500">
                                    {user.role === 'superadmin' ? 'Super Admin' : 'System Admin'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-600 dark:text-red-400 flex items-center justify-between animate-scale-in">
                    <div className="flex items-center gap-3">
                        <XCircleIcon className="w-5 h-5" />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                    <button onClick={dismissMessage} className="hover:text-red-700 transition-colors p-1 hover:bg-red-500/10 rounded-lg">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                {/* Metric 1 */}
                <div
                    onClick={handleShowUsers}
                    className="group relative overflow-hidden glass p-6 rounded-3xl border border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GlobeAmericasIcon className="w-24 h-24 text-blue-600 transform rotate-12" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Nodes</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stats.totalUsers}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                            <span>+12% growth</span>
                        </div>
                    </div>
                </div>

                {/* Metric 2 */}
                {/* Metric 2 */}
                <div
                    onClick={handleShowVerified}
                    className="group relative overflow-hidden glass p-6 rounded-3xl border border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheckIcon className="w-24 h-24 text-purple-600 transform -rotate-12" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Verified Identities</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stats.verifiedUsers}</p>
                        <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                            <div
                                className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${(stats.verifiedUsers / (stats.totalUsers || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Metric 3 */}
                {/* Metric 3 */}
                <div
                    onClick={handleShowNotes}
                    className="group relative overflow-hidden glass p-6 rounded-3xl border border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LockClosedIcon className="w-24 h-24 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Encrypted Vaults</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stats.totalNotes}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">AES-256 / RSA Enforced</p>
                    </div>
                </div>

                {/* Metric 4 */}
                <div
                    onClick={() => window.location.href = '/admin/users?tab=pending-verifications'}
                    className="group relative overflow-hidden glass p-6 rounded-3xl border border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-500/10 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CpuChipIcon className="w-24 h-24 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Pending Syncs</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stats.pendingVerifications}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-500/10 w-fit px-2 py-1 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <span>Requires Attention</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Server Health */}
                <div className="lg:col-span-3 glass p-8 rounded-[2rem] border border-white/10 flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <ServerIcon className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">System Health</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPU & Memory Load</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* CPU Load */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CPU Load</span>
                                <span className="text-xl font-black text-gray-900 dark:text-white">{stats.cpuLoad}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/10 h-3 rounded-full overflow-hidden p-[2px]">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                                    style={{ width: `${stats.cpuLoad}%` }}
                                />
                            </div>
                        </div>

                        {/* Memory Load */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Memory</span>
                                <span className="text-xl font-black text-gray-900 dark:text-white">{stats.memoryUsage}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/10 h-3 rounded-full overflow-hidden p-[2px]">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                                    style={{ width: `${stats.memoryPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Uptime */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Uptime</span>
                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{stats.uptime}</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Users / Verified Modal */}
            {(showUsersModal || showVerifiedModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => { setShowUsersModal(false); setShowVerifiedModal(false); }}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{showUsersModal ? 'System Nodes' : 'Verified Identities'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    {showUsersModal ? 'Full Network Roster' : 'Trust-Level: Verified'}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowUsersModal(false); setShowVerifiedModal(false); }}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Node Data...</span>
                                </div>
                            ) : modalData.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">No users found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modalData.map((user: any) => (
                                        <div key={user._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {user.username}
                                                    </span>
                                                    {user.verified && <CheckCircleIcon className="w-4 h-4 text-blue-500" />}
                                                    {user.role === 'superadmin' && <span className="text-[8px] bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">Super Admin</span>}
                                                    {user.role === 'admin' && <span className="text-[8px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded font-black uppercase">Admin</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${user.verified ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'
                                                    }`}>
                                                    {user.verified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Note Stats Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowNotesModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Encrypted Vaults Distribution</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    Asset Allocation by Node
                                </p>
                            </div>
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Analyzing Vaults...</span>
                                </div>
                            ) : modalData.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">No vaults found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modalData.map((stat: any, index: number) => (
                                        <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                                                #{index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        @{stat.username || 'Unknown'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {stat.email || 'No email'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                                                <LockClosedIcon className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm font-black text-amber-600">
                                                    {stat.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}