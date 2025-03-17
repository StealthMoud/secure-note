'use client';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

export const useProfileLogic = () => {
    const shared = useDashboardSharedContext();
    return shared; // Placeholder; expand as needed
};