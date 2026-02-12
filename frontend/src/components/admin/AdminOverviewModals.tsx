'use client';
import { XMarkIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface AdminOverviewModalsProps {
    showUsersModal: boolean;
    setShowUsersModal: (show: boolean) => void;
    showVerifiedModal: boolean;
    setShowVerifiedModal: (show: boolean) => void;
    showNotesModal: boolean;
    setShowNotesModal: (show: boolean) => void;
    modalData: any[];
    modalLoading: boolean;
}

export const AdminOverviewModals = ({
    showUsersModal,
    setShowUsersModal,
    showVerifiedModal,
    setShowVerifiedModal,
    showNotesModal,
    setShowNotesModal,
    modalData,
    modalLoading
}: AdminOverviewModalsProps) => {

    const closeModal = () => {
        setShowUsersModal(false);
        setShowVerifiedModal(false);
        setShowNotesModal(false);
    };

    if (!(showUsersModal || showVerifiedModal || showNotesModal)) return null;

    return (
        <>
            {/* users / verified modal */}
            {(showUsersModal || showVerifiedModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
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
                                onClick={closeModal}
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
                                    <p className="text-sm font-medium">no users found</p>
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

            {/* note stats modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
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
                                onClick={closeModal}
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
                                    <p className="text-sm font-medium">no vaults found</p>
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
                                                        @{stat.username || 'unknown'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {stat.email || 'no email'}
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
        </>
    );
};
