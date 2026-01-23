'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { DashboardSharedProvider, useDashboardSharedContext } from '@/context/DashboardSharedContext';

export default function Home() {
    const { user, loading } = useDashboardSharedContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                document.title = 'Welcome | Secure Note';
            } else if (user.role === 'admin' || user.role === 'superadmin') {
                router.push('/admin/overview');
            } else {
                router.replace('/dashboard');
            }
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    if (user) {
        return null;
    }


    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4">
            <div className="glass w-full max-w-2xl p-12 md:p-16 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 animate-slide-up-fade text-center relative overflow-hidden">
                {/* subtle background glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 animate-scale-in">
                        <LockClosedIcon className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 italic">
                        Secure <span className="text-blue-600">Note</span>
                    </h1>

                    <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed mb-10">
                        The ultimate secure space for your private notes. Simple, encrypted, and entirely yours.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link href="/login" className="w-full sm:w-48 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-widest">
                            Sign In
                        </Link>
                        <Link href="/register" className="w-full sm:w-48 py-4 glass border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:scale-95 transition-all text-sm uppercase tracking-widest">
                            Get Started
                        </Link>
                    </div>
                </div>

                <div className="mt-16 flex items-center justify-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-50">
                    <span>End-to-End</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>Zero Trust</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>Open Protocol</span>
                </div>
            </div>
        </div>
    );
}

export function RootPageWrapper({ children }: { children: React.ReactNode }) {
    return <DashboardSharedProvider>{children}</DashboardSharedProvider>;
}

Home.getLayout = function getLayout(page: React.ReactNode) {
    return <RootPageWrapper>{page}</RootPageWrapper>;
};
