import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

// reusable glass card component with premium blur effect
// used throughout the app for consistent glassmorphism aesthetic
export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
    return (
        <div
            className={`glass p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
