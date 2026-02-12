'use client';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface BroadcastFormProps {
    message: string;
    setMessage: (msg: string) => void;
    type: 'info' | 'warning' | 'alert';
    setType: (type: 'info' | 'warning' | 'alert') => void;
    loading: boolean;
    onSend: () => void;
}

export const BroadcastForm = ({
    message,
    setMessage,
    type,
    setType,
    loading,
    onSend
}: BroadcastFormProps) => {

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'alert': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 italic">Signal Priority</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['info', 'warning', 'alert'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${type === t
                                ? getTypeColor(t)
                                : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider">{t}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 italic">Payload Content</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter system broadcast payload..."
                    className="w-full h-40 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-black/20 text-gray-900 dark:text-white resize-none transition-all outline-none text-sm leading-relaxed font-medium"
                />
            </div>

            <button
                onClick={onSend}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 ${loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    }`}
            >
                {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                    <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>Transmit Signal</span>
                    </>
                )}
            </button>
        </div>
    );
};
