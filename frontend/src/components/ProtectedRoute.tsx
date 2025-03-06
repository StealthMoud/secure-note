import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/auth';
import { useRouter } from 'next/router';

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                await router.push('/login');
                return;
            }
            try {
                await getCurrentUser(token);
                setLoading(false);
            } catch (error) {
                localStorage.removeItem('token');
                await router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
};

export default ProtectedRoute;
