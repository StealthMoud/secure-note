'use client';
import {
    ShieldCheckIcon,
    XCircleIcon,
    ArrowPathIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useVerifyEmailLogic } from '@/features/auth/hooks/useVerifyEmail';

export default function VerifyEmailPage() {
    const { message, error, isLoading } = useVerifyEmailLogic();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
            <div className="glass w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 animate-slide-up-fade text-center">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6 animate-scale-in">
                        {isLoading ? (
                            <ArrowPathIcon className="h-10 w-10 text-white animate-spin" />
                        ) : error ? (
                            <XCircleIcon className="h-10 w-10 text-white" />
                        ) : (
                            <ShieldCheckIcon className="h-10 w-10 text-white" />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Only show result states to keep UI clean and fast */}

                    {message && (
                        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-scale-in">
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                                {message}
                            </p>
                            <Link href="/login">
                                <button className="mt-8 w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                    Login to Vault <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-2xl animate-scale-in">
                            <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2 tracking-tight">
                                Authentication Failed
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 font-bold leading-relaxed">
                                {error}
                            </p>
                            <Link href="/login">
                                <button className="mt-8 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                    Return to Portal
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {!isLoading && !message && !error && (
                    <p className="mt-10 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Secure Environment Only
                    </p>
                )}
            </div>
        </div>
    );
}