'use client';
import { useDashboardSharedContext } from '../context/DashboardSharedContext';

export const useDashboardLogic = () => {
    const shared = useDashboardSharedContext();
    return shared; // For now, just passes shared context; can expand later
};