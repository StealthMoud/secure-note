'use client';
import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    loading: boolean;
    error?: string | null;
    hasPassword?: boolean;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, loading, error, hasPassword = true }: DeleteAccountModalProps) {
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmText !== 'DELETE') return;
        await onConfirm(password);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="glass-premium w-full max-w-md p-8 rounded-[2.5rem] border border-rose-500/20 shadow-2xl relative animate-scale-in space-y-6">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500">
                        <ExclamationTriangleIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Delete Account?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        This action is <span className="text-rose-500 font-bold uppercase">permanent</span>. All your notes, shared access, and profile data will be permanently erased per GDPR protocols.
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold animate-shake text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleConfirm} className="space-y-4">
                    {hasPassword && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Identity</label>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-all" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type <span className="text-rose-500">DELETE</span> to continue</label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (hasPassword && !password) || confirmText !== 'DELETE'}
                        className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black transition-all active:scale-95 shadow-xl shadow-rose-500/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Processing Erasure...' : 'Delete Everything'}
                    </button>
                </form>
            </div>
        </div>
    );
}
