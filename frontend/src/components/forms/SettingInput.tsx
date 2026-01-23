import React from 'react';

interface SettingInputProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
}

// reusable input component for settings forms
// uses glass aesthetic with icon on left side
export default function SettingInput({
    icon: Icon,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
}: SettingInputProps) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 group-focus-within:text-blue-500 group-focus-within:border-blue-500/30 transition-all">
                    <Icon className="w-4 h-4" />
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                />
            </div>
        </div>
    );
}
