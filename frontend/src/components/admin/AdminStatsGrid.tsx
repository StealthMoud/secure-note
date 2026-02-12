'use client';
import {
    GlobeAmericasIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AdminStatsGridProps {
    stats: {
        totalUsers: number;
        verifiedUsers: number;
        totalNotes: number;
        pendingVerifications: number;
    };
    handleShowUsers: () => void;
    handleShowVerified: () => void;
    handleShowNotes: () => void;
}

export const AdminStatsGrid = ({ stats, handleShowUsers, handleShowVerified, handleShowNotes }: AdminStatsGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* metric 1: total nodes */}
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

            {/* metric 2: verified identities */}
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

            {/* metric 3: encrypted vaults */}
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

            {/* metric 4: pending syncs */}
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
    );
};
