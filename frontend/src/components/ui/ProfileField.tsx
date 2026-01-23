import React from 'react';

interface ProfileFieldProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    color: string;
}

// displays a single profile field with icon and label
// used in profile section to show user info
export default function ProfileField({ icon: Icon, label, value, color }: ProfileFieldProps) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-blue-500/30 transition-all">
            <div className={`p-3 rounded-xl ${color} bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/5`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                    {label}
                </p>
                <p className="font-bold text-gray-900 dark:text-white leading-tight">
                    {value || 'Not Specified'}
                </p>
            </div>
        </div>
    );
}
