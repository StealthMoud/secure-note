import React, { useState } from 'react';
import { loginUser } from '../services/auth';

const LoginPage = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            // @ts-ignore
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            window.location.href = '/dashboard'; // Redirect after login
        } catch (error: any) {
            alert(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl mb-4">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
