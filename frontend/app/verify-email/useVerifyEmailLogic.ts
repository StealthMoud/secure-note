'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/services/auth';

export function useVerifyEmailLogic() {
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        let isMounted = true;

        const verify = async () => {
            const token = searchParams.get('token');

            if (!token) {
                if (isMounted) {
                    setError('No verification token provided.');
                    setIsLoading(false);
                }
                return;
            }

            try {
                const data = await verifyEmail(token);

                if (isMounted && data?.message) {
                    setMessage(data.message);
                    setError('');
                } else {
                    throw new Error('Unexpected response from server');
                }
            } catch (err: any) {
                if (isMounted) {
                    const errorMessage =
                        err.response?.data?.error ||
                        err.message ||
                        'Failed to verify email';
                    setError(errorMessage);
                    setMessage('');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        verify();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    return {
        message,
        error,
        isLoading,
    };
}
