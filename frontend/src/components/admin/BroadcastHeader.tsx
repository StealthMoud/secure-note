'use client';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

export const BroadcastHeader = () => {
    return (
        <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group">
                <MegaphoneIcon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">System <span className="text-blue-600">Broadcasts</span></h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Send global alerts to all active nodes</p>
            </div>
        </div>
    );
};
