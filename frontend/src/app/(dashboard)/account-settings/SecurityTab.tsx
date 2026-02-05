'use client';
import React, { Dispatch, SetStateAction } from 'react';
import {
    PencilIcon,
    EnvelopeIcon,
    LockClosedIcon,
    KeyIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    QrCodeIcon,
} from '@heroicons/react/24/outline';

const SecurityCard = ({ title, children, onSubmit, loading, buttonText, icon: Icon }: any) => (
    <div className="glass p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
            <button
                onClick={onSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
                {loading ? 'Processing...' : buttonText}
            </button>
        </div>
    </div>
);

const SecurityInput = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all">
                <Icon className="w-4 h-4" />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
        </div>
    </div>
);

interface SecurityTabProps {
    user: any;
    username: string;
    setUsername: Dispatch<SetStateAction<string>>;
    newEmail: string;
    setNewEmail: Dispatch<SetStateAction<string>>;
    currentPassword: string;
    setCurrentPassword: Dispatch<SetStateAction<string>>;
    newPassword: string;
    setNewPassword: Dispatch<SetStateAction<string>>;
    confirmNewPassword: string;
    setConfirmNewPassword: Dispatch<SetStateAction<string>>;
    totpEnabled: boolean;
    totpQrCode: string | null;
    totpToken: string;
    setTotpToken: Dispatch<SetStateAction<string>>;
    handleUpdateUsername: () => Promise<void>;
    handleChangeEmail: () => Promise<void>;
    handleChangePassword: () => Promise<void>;
    handleSetupTotp: () => Promise<void>;
    handleVerifyTotp: () => Promise<void>;
    handleDisableTotp: () => Promise<void>;
    setError: (msg: string | null) => void;
    setMessage: (msg: string | null) => void;
    setLoading: (val: boolean) => void;
    loading: boolean;
    isAdmin?: boolean;
}

export default function SecurityTab(props: SecurityTabProps) {
    const wrapAction = (fn: () => Promise<void>, errorPrefix: string) => async () => {
        try {
            props.setLoading(true);
            await fn();
        } catch (err: any) {
            props.setError(err.message || `Failed to ${errorPrefix}`);
        } finally {
            props.setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {!props.isAdmin && (
                <>
                    <SecurityCard
                        title="Update Name"
                        icon={PencilIcon}
                        onSubmit={wrapAction(props.handleUpdateUsername, 'update username')}
                        loading={props.loading}
                        buttonText="Save Name"
                    >
                        <SecurityInput
                            label="New Username"
                            value={props.username}
                            onChange={(e: any) => props.setUsername(e.target.value)}
                            placeholder={props.user?.user.username}
                            icon={IdentificationIcon}
                        />
                    </SecurityCard>

                    <SecurityCard
                        title="Update Email"
                        icon={EnvelopeIcon}
                        onSubmit={wrapAction(props.handleChangeEmail, 'update email')}
                        loading={props.loading}
                        buttonText="Save Email"
                    >
                        <SecurityInput
                            label="New Email Address"
                            value={props.newEmail}
                            onChange={(e: any) => props.setNewEmail(e.target.value)}
                            placeholder={props.user?.user.email}
                            icon={EnvelopeIcon}
                        />
                    </SecurityCard>
                </>
            )}

            <SecurityCard
                title="Change Password"
                icon={LockClosedIcon}
                onSubmit={wrapAction(props.handleChangePassword, 'change password')}
                loading={props.loading}
                buttonText="Update Password"
            >
                <div className="space-y-3">
                    <SecurityInput
                        label="Current Password"
                        type="password"
                        value={props.currentPassword}
                        onChange={(e: any) => props.setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={KeyIcon}
                    />
                    <SecurityInput
                        label="New Password"
                        type="password"
                        value={props.newPassword}
                        onChange={(e: any) => props.setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={LockClosedIcon}
                    />
                    <SecurityInput
                        label="Confirm Password"
                        type="password"
                        value={props.confirmNewPassword}
                        onChange={(e: any) => props.setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={ShieldCheckIcon}
                    />
                </div>
            </SecurityCard>

            <SecurityCard
                title="Two-Factor Authentication"
                icon={ShieldCheckIcon}
                onSubmit={wrapAction(
                    props.totpEnabled ? (props.totpQrCode ? props.handleVerifyTotp : props.handleDisableTotp) : (props.totpQrCode ? props.handleVerifyTotp : props.handleSetupTotp),
                    'handle 2FA'
                )}
                loading={props.loading}
                buttonText={props.totpEnabled ? (props.totpQrCode ? "Verify Code" : "Disable 2FA") : (props.totpQrCode ? "Verify & Enable" : "Enable 2FA")}
            >
                <div className="space-y-4">
                    {props.totpQrCode ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl animate-scale-in">
                                <img src={props.totpQrCode} alt="Sync Protocol" className="w-48 h-48" />
                            </div>
                            <p className="text-xs text-center text-gray-500 font-medium">Scan this QR code with your authenticator app.</p>
                            <SecurityInput
                                label="Verification Code"
                                value={props.totpToken}
                                onChange={(e: any) => props.setTotpToken(e.target.value)}
                                placeholder="000000"
                                icon={KeyIcon}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 text-center space-y-3">
                            <div className={`p-3 rounded-2xl ${props.totpEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                <ShieldCheckIcon className="w-10 h-10" />
                            </div>
                            <h4 className="font-black text-gray-900 dark:text-white">
                                {props.totpEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                {props.totpEnabled ? 'Your account is protected with an additional security layer.' : 'Enable two-factor authentication to add an additional layer of security to your account.'}
                            </p>
                            {props.totpEnabled && (
                                <SecurityInput
                                    label="Disable Code"
                                    value={props.totpToken}
                                    onChange={(e: any) => props.setTotpToken(e.target.value)}
                                    placeholder="Enter current code"
                                    icon={KeyIcon}
                                />
                            )}
                        </div>
                    )}
                </div>
            </SecurityCard>
        </div>
    );
}

// helper icon component
const IdentificationIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
    </svg>
);