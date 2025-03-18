'use client';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { useState } from 'react';

export const useAccountSettingsLogic = () => {
    const shared = useDashboardSharedContext();
    const { user, handleRequestVerification } = shared;

    // Local state for settings
    const [username, setUsername] = useState(user?.user.username || '');
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Simulate updating username (replace with real API call if available)
    const handleUpdateUsername = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setMessage('Username updated successfully!');
            // Update context if needed: shared.setUser({ ...user, user: { ...user.user, username } });
        } catch (err) {
            setError('Failed to update username.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle theme (simulated; integrate with your theme system if available)
    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
        // Add logic to update document.documentElement.classList if you use Tailwind dark mode
        document.documentElement.classList.toggle('dark', !isDarkMode);
    };

    return {
        user,
        username,
        setUsername,
        isDarkMode,
        toggleTheme,
        handleRequestVerification,
        handleUpdateUsername,
        message,
        error,
        loading,
    };
};