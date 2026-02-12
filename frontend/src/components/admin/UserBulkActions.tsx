'use client';
import { ShieldCheckIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UserBulkActionsProps {
    selectedCount: number;
    onClear: () => void;
    onBulkVerify: () => void;
    onBulkDelete: () => void;
}

export const UserBulkActions = ({ selectedCount, onClear, onBulkVerify, onBulkDelete }: UserBulkActionsProps) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-6 px-6 py-4 glass-dark rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black">
                        {selectedCount}
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">Users Selected</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onBulkVerify}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <ShieldCheckIcon className="w-4 h-4" /> Verify All
                    </button>
                    <button
                        onClick={onBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <TrashIcon className="w-4 h-4" /> Delete All
                    </button>
                    <button
                        onClick={onClear}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Deselect All"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
