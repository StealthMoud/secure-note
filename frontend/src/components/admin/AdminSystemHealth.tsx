'use client';
import { ServerIcon } from '@heroicons/react/24/outline';

interface AdminSystemHealthProps {
    stats: {
        cpuLoad: number;
        memoryPercentage: number;
        memoryUsage: string;
        uptime: string;
    };
}

export const AdminSystemHealth = ({ stats }: AdminSystemHealthProps) => {
    return (
        <div className="lg:col-span-3 glass p-8 rounded-[2rem] border border-white/10 flex flex-col md:flex-row justify-between gap-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <ServerIcon className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">System Health</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPU & Memory Load</p>
                </div>
            </div>

            <div className="space-y-8 min-w-[300px]">
                {/* cpu load */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CPU Load</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{stats.cpuLoad}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/10 h-3 rounded-full overflow-hidden p-[2px]">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                            style={{ width: `${stats.cpuLoad}%` }}
                        />
                    </div>
                </div>

                {/* memory load */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Memory</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{stats.memoryUsage}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/10 h-3 rounded-full overflow-hidden p-[2px]">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                            style={{ width: `${stats.memoryPercentage}%` }}
                        />
                    </div>
                </div>

                {/* uptime */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Uptime</span>
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{stats.uptime}</span>
                </div>
            </div>
        </div>
    );
};
