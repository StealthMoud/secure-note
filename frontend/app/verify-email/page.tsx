'use client';
import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {verifyEmail} from '@/services/auth';

export default function VerifyEmailPage() {
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const searchParams = useSearchParams();

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            console.log('Token from URL:', token);
            if (!token) {
                setError('No verification token provided.');
                return;
            }

            try {
                console.log('Calling verifyEmail with token:', token);
                const data = await verifyEmail(token);
                console.log('verifyEmail response:', data);
                setMessage(data.message);
            } catch (err: any) {
                console.error('Verification error:', err.message, err.response?.data, err);
                setError(err.response?.data?.error || err.message || 'Failed to verify email');
            }
        };
        verify();
    }, [searchParams]);

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Verify Email</h1>

            {message && (
                <>
                    <p className="text-green-500 text-sm mb-4">{message}</p>
                    <p className="text-gray-600 text-sm">
                        Your email has been successfully verified. You can now log in and start using your account.
                    </p>
                </>
            )}

            {error && (
                <>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <p className="text-gray-600 text-sm">
                        If you believe this is a mistake, try clicking the verification link again or request a new one.
                    </p>
                </>
            )}

            {!message && !error && (
                <p className="text-gray-500">Verifying your email, please wait...</p>
            )}
        </div>
    );

}