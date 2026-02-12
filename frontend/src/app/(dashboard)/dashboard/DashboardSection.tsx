'use client';
import React from 'react';
import { useDashboardLogic } from '@/features/dashboard/hooks/useDashboard';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { IdentityProfile } from '@/features/dashboard/components/IdentityProfile';
import { VerificationStatus } from '@/features/dashboard/components/VerificationStatus';

export default function DashboardSection() {
    const { user, message, error, loading, handleRequestVerification, noteCount, friendsCount } = useDashboardLogic();

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up-fade">
            <DashboardHeader user={user.user} />

            <DashboardStats
                user={user.user}
                noteCount={noteCount}
                friendsCount={friendsCount}
            />

            <div className={`grid grid-cols-1 md:grid-cols-1 gap-8`}>
                <section className="space-y-6">
                    {user.user.verified ? (
                        <IdentityProfile user={user.user} />
                    ) : (
                        <VerificationStatus
                            user={user.user}
                            loading={loading}
                            message={message}
                            error={error}
                            onRequestVerification={handleRequestVerification}
                        />
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