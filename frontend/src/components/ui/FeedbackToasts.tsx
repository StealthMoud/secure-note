'use client';

import React from 'react';
import { XMarkIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface FeedbackToastsProps {
    error: string | null;
    message: string | null;
    isExitingError: boolean;
    isExitingMessage: boolean;
    dismissError: () => void;
    dismissMessage: () => void;
}

export const FeedbackToasts: React.FC<FeedbackToastsProps> = ({
    error,
    message,
    isExitingError,
    isExitingMessage,
    dismissError,
    dismissMessage,
}) => {
    return (
        <div className="fixed top-24 right-4 z-[110] flex flex-col gap-4 pointer-events-none">
            {error && (
                <div className={`pointer-events-auto glass p-6 rounded-2xl border-rose-500/20 shadow-2xl flex items-center gap-4 transition-all duration-500 ${isExitingError ? 'opacity-0 -translate-y-4 scale-95' : 'animate-fade-slide-up hover:scale-[1.02]'}`}>
                    <div className="p-2.5 bg-rose-500/10 rounded-xl">
                        <XCircleIcon className="h-6 w-6 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Error</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{error}</p>
                    </div>
                    <button onClick={() => dismissError()} className="p-1.5 hover:bg-rose-500/10 rounded-xl transition-all">
                        <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            )}

            {message && (
                <div className={`pointer-events-auto glass p-6 rounded-2xl border-emerald-500/20 shadow-2xl flex items-center gap-4 transition-all duration-500 ${isExitingMessage ? 'opacity-0 translate-x-10 scale-95' : 'animate-fade-slide-up hover:scale-[1.02]'}`}>
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Success</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{message}</p>
                    </div>
                    <button onClick={() => dismissMessage()} className="p-1.5 hover:bg-emerald-500/10 rounded-xl transition-all">
                        <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            )}
        </div>
    );
};
