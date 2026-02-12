import React from 'react';
import Link from 'next/link';
import {
    DocumentTextIcon,
    UsersIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { User } from '@/types/user';

interface DashboardStatsProps {
    user: User;
    noteCount: number;
    friendsCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ user, noteCount, friendsCount }) => {
    const stats = [
        {
            label: 'Vault Notes',
            value: noteCount.toString(),
            icon: DocumentTextIcon,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            href: '/notes'
        },
        {
            label: 'Network Friends',
            value: friendsCount.toString(),
            icon: UsersIcon,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            href: '/friends'
        },
        {
            label: 'Security Status',
            value: user.verified && user.isTotpEnabled ? 'Secure' : (user.verified ? 'Verified' : 'Unverified'),
            icon: ShieldCheckIcon,
            color: (user.verified && user.isTotpEnabled) ? 'text-emerald-500' : 'text-amber-500',
            bg: (user.verified && user.isTotpEnabled) ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            href: '/account-settings'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <Link
                    key={stat.label}
                    href={stat.href}
                    className="glass p-6 rounded-2xl flex items-center gap-4 animate-scale-in transition-all hover:bg-white/30 dark:hover:bg-white/5 group active:scale-95"
                    style={{ animationDelay: `${i * 0.1}s` }}
                >
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{stat.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};
