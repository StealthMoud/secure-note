'use client';
import {
    XCircleIcon,
    XMarkIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { useAdminOverview } from '@/features/admin/hooks/useAdminOverview';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminSystemHealth } from '@/components/admin/AdminSystemHealth';
import { AdminOverviewModals } from '@/components/admin/AdminOverviewModals';

export default function Page() {
    const { user } = useDashboardSharedContext();
    const {
        stats,
        loading,
        error,
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
    } = useAdminOverview();

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
            {/* header section */}
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
                    {/* security status card */}
                    <div
                        onClick={() => window.location.href = '/admin/settings'}
                        className={`flex items-center gap-4 p-4 rounded-2xl glass border-l-4 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 ${user?.user.isTotpEnabled ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10'}`}
                        title={user?.user.isTotpEnabled ? 'Security active' : 'click to enhance protection'}
                    >
                        <div className={`p-2 rounded-xl ${user?.user.isTotpEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
                            <ShieldCheckIcon className={`w-6 h-6 ${user?.user.isTotpEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${user?.user.isTotpEnabled ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-amber-600/70 dark:text-amber-400/70'}`}>Security Status</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{user?.user.isTotpEnabled ? 'ENHANCED' : 'BASIC'}</p>
                        </div>
                    </div>

                    {/* admin profile chip */}
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

            {/* core metrics grid */}
            <AdminStatsGrid
                stats={stats}
                handleShowUsers={handleShowUsers}
                handleShowVerified={handleShowVerified}
                handleShowNotes={handleShowNotes}
            />

            {/* advanced visualization grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* server health */}
                <AdminSystemHealth stats={stats} />
            </div>

            {/* modals section */}
            <AdminOverviewModals
                showUsersModal={showUsersModal}
                setShowUsersModal={setShowUsersModal}
                showVerifiedModal={showVerifiedModal}
                setShowVerifiedModal={setShowVerifiedModal}
                showNotesModal={showNotesModal}
                setShowNotesModal={setShowNotesModal}
                modalData={modalData}
                modalLoading={modalLoading}
            />
        </div>
    );
}