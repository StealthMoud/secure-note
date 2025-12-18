'use client';
import { useVerifyEmailLogic } from './useVerifyEmailLogic';

export default function VerifyEmailPage() {
    const { message, error, isLoading } = useVerifyEmailLogic();

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Verify Email</h1>

            {isLoading && (
                <p className="text-gray-500">Verifying your email, please wait...</p>
            )}

            {!isLoading && message && (
                <>
                    <p className="text-green-500 text-sm mb-4">{message}</p>
                </>
            )}

            {!isLoading && !message && error && (
                <>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                </>
            )}
        </div>
    );
}