'use client';
import { ShieldCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface SecurityLogsHeaderProps {
    onExport: (format: 'csv' | 'pdf') => void;
}

export const SecurityLogsHeader = ({ onExport }: SecurityLogsHeaderProps) => {
    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheckIcon className="w-3 h-3" />
                    Audit Trail
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight italic">Security <span className="text-blue-600">Intelligence</span></h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monitor all node activities and system events.</p>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={() => onExport('csv')} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-all active:scale-95 flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" /> CSV Export
                </button>
                <button onClick={() => onExport('pdf')} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-all active:scale-95 flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" /> PDF Dump
                </button>
            </div>
        </header>
    );
};
