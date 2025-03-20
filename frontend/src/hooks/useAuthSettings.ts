'use client';
import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { changeEmail, changePassword, setupTotp, verifyTotp, disableTotp, requestVerification, updateUsername } from '@/services/auth';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

interface AuthSettings {
    user: ReturnType<typeof useDashboardSharedContext>['user'];
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
    setTotpEnabled: Dispatch<SetStateAction<boolean>>;
    totpQrCode: string | null;
    setTotpQrCode: Dispatch<SetStateAction<string | null>>;
    totpToken: string;
    setTotpToken: Dispatch<SetStateAction<string>>;
    handleUpdateUsername: () => Promise<void>;
    handleChangeEmail: () => Promise<void>;
    handleChangePassword: () => Promise<void>;
    handleSetupTotp: () => Promise<void>;
    handleVerifyTotp: () => Promise<void>;
    handleDisableTotp: () => Promise<void>;
    handleRequestVerification: () => Promise<void>;
    message: string | null;
    error: string | null;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

export const useAuthSettings = (): AuthSettings => {
    const { user, setUser } = useDashboardSharedContext();

    const [username, setUsernameState] = useState(user?.user.username || '');
    const originalUsernameRef = useRef(user?.user.username || ''); // Static initial value
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [totpEnabled, setTotpEnabled] = useState(user?.user.isTotpEnabled || false);
    const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
    const [totpToken, setTotpToken] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(!!user);

    useEffect(() => {
        if (!isInitialized && user) {
            console.log('Initializing auth settings:', {
                username: user.user.username,
                originalUsername: originalUsernameRef.current,
                totpEnabled: user.user.isTotpEnabled
            });
            setUsernameState(user.user.username || '');
            setTotpEnabled(user.user.isTotpEnabled || false);
            setIsInitialized(true);
        }
    }, [user, isInitialized]);

    const updateUserField = (field: keyof NonNullable<typeof user>['user'], value: string) => {
        if (!user) return;
        console.log('Updating user field:', { field, value });
        setUser({
            ...user,
            user: { ...user.user, [field]: value },
        });
    };

    const handleUpdateUsername = async () => {
        const originalUsername = originalUsernameRef.current;
        console.log('handleUpdateUsername called:', { username, originalUsername });
        if (!username || username === originalUsername) {
            console.log('No username changes detected or username empty');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            console.log('Sending username update:', username);
            const response = await updateUsername(username);
            updateUserField('username', username);
            originalUsernameRef.current = username; // Update only on success
            setMessage('Username updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update username');
            console.error('Update username error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = async () => {
        console.log('handleChangeEmail called:', { newEmail, currentEmail: user?.user.email });
        if (!newEmail || newEmail === user?.user.email) {
            console.log('No email changes detected or email empty');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            console.log('Sending email update:', newEmail);
            const response = await changeEmail(newEmail);
            updateUserField('email', newEmail);
            setNewEmail('');
            setMessage(response.message || 'Email change requested. Check your new email');
        } catch (err: any) {
            setError(err.message || 'Failed to change email');
            console.error('Change email error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        console.log('handleChangePassword called:', { currentPassword, newPassword, confirmNewPassword });

        // If no fields are filled at all, assume no intent to change password
        if (!currentPassword && !newPassword && !confirmNewPassword) {
            console.log('No password change intended');
            return;
        }

        // All fields must be filled if user wants to change password
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            console.log('Password fields incomplete');
            setError('All password fields are required when changing password');
            return;
        }

        // Password match check
        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            console.log('Password mismatch');
            return;
        }

        // Password length validation (only one rule now)
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            console.log('Password validation failed: too short');
            return;
        }

        // Proceed with password update
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            console.log('Sending password update');
            const response = await changePassword(currentPassword, newPassword);
            setMessage('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
            console.error('Change password error:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleSetupTotp = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { qrCodeDataURL } = await setupTotp();
            setTotpQrCode(qrCodeDataURL);
            setMessage('Scan the QR code to enable 2FA');
        } catch (err: any) {
            setError(err.message || 'Failed to setup 2FA');
            console.error('Setup 2FA error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async () => {
        if (!totpToken) return;
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await verifyTotp(totpToken);
            setTotpEnabled(true);
            setTotpQrCode(null);
            setTotpToken('');
            updateUserField('isTotpEnabled', 'true');
            setMessage('2FA enabled successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to verify 2FA');
            console.error('Verify 2FA error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDisableTotp = async () => {
        if (!totpToken) {
            setError('Please enter a TOTP code to disable 2FA');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await disableTotp(totpToken);
            setTotpEnabled(false);
            setTotpToken('');
            updateUserField('isTotpEnabled', 'false');
            setMessage('2FA disabled successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to disable 2FA');
            console.error('Disable 2FA error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestVerification = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await requestVerification();
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'Failed to request verification');
            console.error('Request verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        username,
        setUsername: setUsernameState,
        newEmail,
        setNewEmail,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        totpEnabled,
        setTotpEnabled,
        totpQrCode,
        setTotpQrCode,
        totpToken,
        setTotpToken,
        handleUpdateUsername,
        handleChangeEmail,
        handleChangePassword,
        handleSetupTotp,
        handleVerifyTotp,
        handleDisableTotp,
        handleRequestVerification,
        message,
        error,
        loading,
        setLoading,
    };
};