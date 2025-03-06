import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const data = await getCurrentUser(token);
                setUser(data);
            }
        };
        fetchUser();
    }, []);

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl mb-4">Dashboard</h1>
                {user?.role === 'admin' && <p>Welcome, Admin!</p>}
                {user?.role === 'user' && <p>Welcome, User!</p>}
            </div>
        </ProtectedRoute>
    );
};


export default Dashboard;
