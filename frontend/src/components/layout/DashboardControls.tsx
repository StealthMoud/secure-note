'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
    SunIcon,
    MoonIcon,
    ShieldCheckIcon,
    KeyIcon,
    CheckCircleIcon,
    ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { useNotificationContext } from '@/context/NotificationContext';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface DashboardControlsProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showProfileDropdown: boolean;
    setShowProfileDropdown: (value: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function DashboardControls({
    isDarkMode,
    toggleDarkMode,
    showProfileDropdown,
    setShowProfileDropdown,
    dropdownRef,
}: DashboardControlsProps) {
    const { user, handleLogout } = useDashboardSharedContext();
    const { notificationCount } = useNotificationContext();
    const router = useRouter();
    const pathname = usePathname();

    // auto-close dropdown when user state change
    useEffect(() => {
        setShowProfileDropdown(false);
    }, [user, setShowProfileDropdown]);

    // use our new custom hook to close dropdown on outside click
    useOnClickOutside(dropdownRef, () => {
        if (showProfileDropdown) setShowProfileDropdown(false);
    });

    const handleProfileClick = () => {
        setShowProfileDropdown(false);
        router.push('/profile');
    };

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const avatarUrl = user?.user.avatar ? `${backendUrl}${user.user.avatar}?t=${Date.now()}` : '/default-avatar.jpg';

    if (!user) return null;

    return (
        <div className="fixed top-6 right-6 flex items-center gap-3 z-50 animate-fadeInShort">
            {/* Control Group */}
            <div className="glass-premium px-2.5 py-2 rounded-[1.25rem] flex items-center gap-1.5 shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-2xl">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 group"
                    aria-label="Toggle Theme"
                >
                    {isDarkMode ? (
                        <SunIcon className="h-5 w-5 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                    ) : (
                        <MoonIcon className="h-5 w-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-500" />
                    )}
                </button>
            </div>

            {/* Profile Section */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={`p-2 glass-premium rounded-[1.25rem] border transition-all active:scale-95 shadow-2xl backdrop-blur-2xl ${user.role === 'admin' || user.role === 'superadmin'
                        ? 'border-blue-500/30'
                        : 'border-white/20 dark:border-white/10 hover:border-blue-500/50 hover:scale-105'
                        }`}
                >
                    <div className="relative">
                        {user.role === 'admin' || user.role === 'superadmin' ? (
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all bg-white dark:bg-gray-900 border-2 ${user.role === 'superadmin'
                                ? 'border-blue-500 animate-orb-glow shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'border-slate-400 dark:border-slate-600'
                                }`}>
                                {user.role === 'superadmin' ? (
                                    <ShieldCheckIcon className="w-6 h-6 text-blue-500 animate-pulse-subtle" />
                                ) : (
                                    <KeyIcon className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                                )}
                            </div>
                        ) : (
                            <>
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/5"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center ${user.user.verified ? 'bg-blue-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}>
                                    <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
                                </div>
                            </>
                        )}
                    </div>
                </button>

                {/* Premium Dropdown */}
                {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-4 w-72 glass-premium rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-2 animate-scale-in origin-top-right z-50 backdrop-blur-3xl">
                        <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-white/5 mb-2 pb-4">
                            {user.role === 'admin' || user.role === 'superadmin' ? (
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all bg-white dark:bg-gray-900 border-2 ${user.role === 'superadmin'
                                    ? 'border-blue-500 shadow-lg'
                                    : 'border-slate-400 dark:border-slate-600 shadow-lg'
                                    }`}>
                                    {user.role === 'superadmin' ? (
                                        <ShieldCheckIcon className="w-7 h-7 text-blue-500" />
                                    ) : (
                                        <KeyIcon className="w-7 h-7 text-slate-400 dark:text-slate-600" />
                                    )}
                                </div>
                            ) : (
                                <img src={avatarUrl} className="h-12 w-12 rounded-2xl object-cover shadow-lg ring-1 ring-black/5 dark:ring-white/5" />
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{user.user.username}</p>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest truncate">
                                    {user.role === 'superadmin' ? 'Super Administrator' : user.role === 'admin' ? 'System Administrator' : user.user.email}
                                </p>
                                {(user.role === 'admin' || user.role === 'superadmin') && (
                                    <div className={`mt-1 inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${user.role === 'superadmin'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                        : 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                                        }`}>
                                        {user.role === 'superadmin' ? 'Strategic Access' : 'Root Access'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-600 dark:text-slate-300 hover:Rose-600 dark:hover:text-rose-400 transition-all group">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-colors">
                                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-wider">Terminate Session</p>
                                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-tight">Revoke access keys</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
