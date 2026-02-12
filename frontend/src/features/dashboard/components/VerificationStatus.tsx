import React from 'react';
import {
    ShieldCheckIcon,
    InformationCircleIcon,
    LockClosedIcon,
    SparklesIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types/user';

interface VerificationStatusProps {
    user: User;
    loading: boolean;
    message?: string;
    error?: string;
    onRequestVerification: () => void;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
    user,
    loading,
    message,
    error,
    onRequestVerification
}) => {
    // Determine the state based on user flags
    const isPending = user.verificationPending;
    const isRejected = user.verificationRejected;
    const hasToken = !!user.verificationToken; // Treat string or boolean true as existing

    // Helper to render the title
    const getTitle = () => {
        if (isPending) return 'Verification Pending';
        if (isRejected) return 'Request Rejected';
        if (hasToken) return 'Action Required';
        return 'Identity Verification';
    };

    // Helper to render the description
    const getDescription = () => {
        if (isPending) return 'Your request has been received and is currently being reviewed by our security team. You will be notified once approved.';
        if (isRejected) return 'Your verification request was rejected by an administrator. Please update your profile or contact support before requesting again.';
        if (hasToken) return 'Admin has approved your request! Please check your email for the verification link to complete the process.';
        return 'You are currently surfing in lite mode. Verify your identity to unlock all premium node features.';
    };

    // Helper to render the action button or status badge
    const renderAction = () => {
        if (isPending) {
            return (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black text-xs uppercase tracking-widest">
                    <SparklesIcon className="w-4 h-4 animate-pulse" />
                    Awaiting Admin Approval
                </div>
            );
        }

        if (isRejected) {
            return (
                <button
                    onClick={onRequestVerification}
                    disabled={loading}
                    className="px-8 py-3 bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Request Again'}
                </button>
            );
        }

        if (hasToken) {
            return (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 font-black text-xs uppercase tracking-widest">
                    <EnvelopeIcon className="w-4 h-4" />
                    Check Your Email
                </div>
            );
        }

        // Default: Not verified, not pending, not rejected, no token -> Allow request
        return (
            <button
                onClick={onRequestVerification}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Verify Now'}
            </button>
        );
    };

    return (
        <div className="glass p-10 rounded-2xl text-center border border-blue-500/20 max-w-2xl mx-auto shadow-xl">
            {message && (
                <div className="mb-6 mx-auto max-w-md p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 animate-fadeIn">
                    <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                        <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-green-700 dark:text-green-400">{message}</p>
                </div>
            )}
            {error && (
                <div className="mb-6 mx-auto max-w-md p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-fadeIn">
                    <div className="p-1.5 rounded-full bg-red-500/20 text-red-600">
                        <InformationCircleIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            <LockClosedIcon className="w-12 h-12 mx-auto text-blue-500 mb-6" />

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                {getTitle()}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-base mb-8 leading-relaxed">
                {getDescription()}
            </p>

            {renderAction()}
        </div>
    );
};
