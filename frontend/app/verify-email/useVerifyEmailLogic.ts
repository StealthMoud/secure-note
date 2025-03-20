'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/services/auth';

export function useVerifyEmailLogic() {
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

    return {
        message,
        error
    };
}