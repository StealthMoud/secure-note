'use client';
import React from 'react';
import { useDashboardLogic } from '@/features/dashboard/hooks/useDashboard';
import {
    ChartBarIcon,
    LockClosedIcon,
    EnvelopeIcon,
    UserIcon,
    CalendarIcon,
    TagIcon,
    PencilIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UsersIcon,
    DocumentTextIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardSection() {
    const { user, message, error, loading, handleRequestVerification, noteCount, friendsCount } = useDashboardLogic();

    if (!user) return null;

    // clean dashboard stats focused on real node data
    const stats = [
        { label: 'Vault Notes', value: noteCount.toString(), icon: DocumentTextIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/notes' },
        { label: 'Network Friends', value: friendsCount.toString(), icon: UsersIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10', href: '/friends' },
        {
            label: 'Security Status',
            value: user.user.verified && user.user.isTotpEnabled ? 'Secure' : (user.user.verified ? 'Verified' : 'Unverified'),
            icon: ShieldCheckIcon,
            color: (user.user.verified && user.user.isTotpEnabled) ? 'text-emerald-500' : 'text-amber-500',
            bg: (user.user.verified && user.user.isTotpEnabled) ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            href: '/account-settings'
        },
    ];

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up-fade">
            {/* simplified classy header */}
            <header className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 md:p-10 shadow-xl border border-gray-100 dark:border-white/5">
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10">
                    <div className="text-center md:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                            <LockClosedIcon className="w-3.5 h-3.5" />
                            Personal Node
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            Hi, <span className="text-blue-600 dark:text-blue-400">{user.user.username}</span>.
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto md:mx-0 font-medium leading-relaxed">
                            {user.user.verified
                                ? 'Your encryption keys are synced and your vault is ready.'
                                : 'Currently operating in lite mode. Verify your identity for full access.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 p-1 pr-6 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10">
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-500/20">
                            {user.user.username[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wide">{user.user.role}</p>
                            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Account Tier</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* real data stat cards - simple and glassy */}
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

            {/* content area */}
            <div className={`grid grid-cols-1 ${user.user.verified ? 'md:grid-cols-1' : 'md:grid-cols-1'} gap-8`}>
                <section className={`${user.user.verified ? '' : ''} space-y-6`}>
                    {user.user.verified ? (
                        <div className="glass p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                                    <UserIcon className="w-6 h-6 mr-3 text-blue-500" />
                                    Identity Profile
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
                                            <EnvelopeIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{user.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600">
                                            <CalendarIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(user.user.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600">
                                            <InformationCircleIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Personal Bio</p>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                                {user.user.bio || 'no encrypted bio set yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-10 rounded-2xl text-center border border-blue-500/20 max-w-2xl mx-auto shadow-xl">
                            {message && (
                                <div className="mb-6 mx-auto max-w-md p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 animate-fadeIn">
                                    <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                                        <ShieldCheckIcon className="w-4 h-4" />
                                    </div>
                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">{message}</p>
                                </div>
                            )}
                            {error && (
                                <div className="mb-6 mx-auto max-w-md p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-fadeIn">
                                    <div className="p-1.5 rounded-full bg-red-500/20 text-red-600">
                                        <InformationCircleIcon className="w-4 h-4" />
                                    </div>
                                    <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            )}
                            <LockClosedIcon className="w-12 h-12 mx-auto text-blue-500 mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                                {user.user.verificationPending
                                    ? 'Verification Pending'
                                    : (user.user.verificationRejected
                                        ? 'Request Rejected'
                                        : (user.user.verificationToken ? 'Action Required' : 'Identity Verification')
                                    )
                                }
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base mb-8 leading-relaxed">
                                {user.user.verificationPending
                                    ? 'Your request has been received and is currently being reviewed by our security team. You will be notified once approved.'
                                    : (user.user.verificationRejected
                                        ? 'Your verification request was rejected by an administrator. Please update your profile or contact support before requesting again.'
                                        : (user.user.verificationToken
                                            ? 'Admin has approved your request! Please check your email for the verification link to complete the process.'
                                            : 'You are currently surfing in lite mode. Verify your identity to unlock all premium node features.')
                                    )
                                }
                            </p>

                            {user.user.verificationPending ? (
                                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black text-xs uppercase tracking-widest">
                                    <SparklesIcon className="w-4 h-4 animate-pulse" />
                                    Awaiting Admin Approval
                                </div>
                            ) : (
                                user.user.verificationRejected ? (
                                    <button
                                        onClick={handleRequestVerification}
                                        disabled={loading}
                                        className="px-8 py-3 bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Request Again'}
                                    </button>
                                ) : (
                                    user.user.verificationToken ? (
                                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 font-black text-xs uppercase tracking-widest">
                                            <EnvelopeIcon className="w-4 h-4" />
                                            Check Your Email
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleRequestVerification}
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Verify Now'}
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    )}
                </section>


            </div>

            <footer className="text-center pt-8 border-t border-gray-100 dark:border-white/5">
                <p className="text-gray-400 dark:text-gray-600 text-[9px] font-bold uppercase tracking-[0.4em]">
                    Encrypted Core v4.2.0 • Node {user.user._id.slice(-8)}
                </p>
            </footer>
        </div>
    );
}