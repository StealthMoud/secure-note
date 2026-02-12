'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AdminUserModalsProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'logs' | 'broadcasts' | 'confirmation';
    data?: any[];
    loading?: boolean;
    selectedUsername?: string;
    // for confirmation type:
    modalConfig?: {
        title: string;
        message: string;
        action: () => Promise<void>;
        type: 'danger' | 'warning';
    };
}

export const AdminUserModals = ({
    isOpen,
    onClose,
    type,
    data = [],
    loading = false,
    selectedUsername = '',
    modalConfig
}: AdminUserModalsProps) => {

    if (!isOpen) return null;

    if (type === 'confirmation' && modalConfig) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xl max-w-sm w-full p-6 animate-scaleIn">
                    <h3 className={`text-lg font-bold mb-2 ${modalConfig.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>
                        {modalConfig.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                        {modalConfig.message}
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                await modalConfig.action();
                                onClose();
                            }}
                            className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg transition-all ${modalConfig.type === 'danger'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                }`}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-scaleIn"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white capitalize">
                            {type === 'logs' ? 'Admin Activity Log' : 'Broadcast History'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                            History for <span className="text-blue-500">@{selectedUsername}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading History...</span>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-sm font-medium">no data found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {type === 'logs' ? (
                                data.map((log: any) => (
                                    <div key={log._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex gap-4">
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.severity === 'high' ? 'bg-red-500' :
                                            log.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                                    {log.event.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-white/5 overflow-x-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                data.map((broadcast: any) => (
                                    <div key={broadcast._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex gap-4">
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${broadcast.type === 'alert' ? 'bg-red-500' :
                                            broadcast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                                    {broadcast.type}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {new Date(broadcast.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium bg-white dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5 mb-1">
                                                {broadcast.message}
                                            </p>
                                            {broadcast.expiresAt && (
                                                <p className="text-[10px] text-gray-400 italic text-right">
                                                    expires: {new Date(broadcast.expiresAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
