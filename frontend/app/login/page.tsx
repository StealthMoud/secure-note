'use client';
import { useState } from 'react';
import { loginUser } from '@/services/auth';
import Link from 'next/link';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>(''); // For success message

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const data = await loginUser(identifier, password);
            localStorage.setItem('token', data.token);
            setMessage('Login successful! Redirecting...');
            setTimeout(() => window.location.href = '/dashboard', 1000); // Delay for feedback
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or Username"
                    className="border p-2 w-full rounded"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="border p-2 w-full rounded"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Login</button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-500 text-sm">{message}</p>}
            </form>
            <p className="mt-2 text-sm">
                Don’t have an account? <Link href="/register" className="text-blue-500">Register</Link>
            </p>
        </div>
    );
}