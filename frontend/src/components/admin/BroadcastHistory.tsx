'use client';

interface BroadcastHistoryProps {
    history: any[];
}

export const BroadcastHistory = ({ history }: BroadcastHistoryProps) => {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 italic">Transmission Log</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <p className="text-sm text-gray-400 italic font-medium">no broadcast history available in this sector.</p>
                ) : (
                    history.map((broadcast) => (
                        <div key={broadcast._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 transition-colors hover:border-blue-500/20">
                            <div className="flex items-start justify-between mb-2">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${broadcast.type === 'alert' ? 'bg-rose-500/10 text-rose-500' :
                                    broadcast.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {broadcast.type}
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {new Date(broadcast.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                {broadcast.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
                                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[8px] text-white font-black shadow-lg shadow-blue-500/20">
                                    {broadcast.createdBy?.username?.[0] || 'A'}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Sent by {broadcast.createdBy?.username || 'Unknown Node'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
