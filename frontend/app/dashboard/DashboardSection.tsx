'use client';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

export default function DashboardSection() {
    const { user } = useDashboardSharedContext();

    if (!user) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome, {user.user.username}!
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">This is your dashboard.</p>
        </div>
    );
}