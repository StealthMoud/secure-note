'use client';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSharedProvider, useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import DashboardContent from './dashboard/DashboardContent';

export default function Home() {
    const { user, loading } = useDashboardSharedContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                document.title = 'Home | Secure Note';
            } else if (user.role === 'admin') {
                router.push('/admin');
            } else {
                document.title = 'Dashboard | Secure Note';
            }
        }
    }, [user, loading, router]);

    if (loading) return <div className="text-center mt-10 text-gray-700 dark:text-gray-300">Loading...</div>;

    if (user && user.role !== 'admin') {
        return <DashboardContent defaultTab="dashboard" />;
    }

    return (
        <div
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 text-center w-full max-w-md mx-auto my-12 perspective-container group overflow-visible"
        >
            <div className="relative transform-style preserve-3d transition-transform duration-700 group-hover:rotate-x-6 group-hover:rotate-y-6 group-hover:scale-105">
                <div className="relative z-20">
                    <LockClosedIcon
                        className="h-28 w-28 mx-auto text-gray-400 dark:text-gray-500 animate-float3D drop-shadow-md hover:scale-110 hover:drop-shadow-lg transition-transform duration-500"
                        aria-label="Secure Note Icon"
                    />
                </div>
                <h1
                    className="text-4xl font-bold tracking-wide text-gray-900 dark:text-gray-100 mt-6 animate-fade-slide3D relative z-10 text-shadow-md"
                >
                    Welcome to Secure Note
                </h1>
                <p
                    className="mt-4 text-lg text-gray-700 dark:text-gray-300 animate-fade-slide3D animation-delay-200 relative z-10 text-shadow-sm"
                >
                    Your private space for notes and ideas.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                        href="/login"
                        className="bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transition-transform duration-300 relative z-10 hover:animate-wobble3D"
                        aria-label="Login to Secure Note"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transition-transform duration-300 relative z-10 hover:animate-wobble3D"
                        aria-label="Register for Secure Note"
                    >
                        Register
                    </Link>
                </div>
            </div>

            <style jsx>{`
                /* Container Perspective */
                .perspective-container {
                    perspective: 1500px;
                }
                .transform-style {
                    transform-style: preserve-3d;
                }
                /* Float 3D effect */
                @keyframes float3D {
                    0%, 100% {
                        transform: translateY(0) rotateX(0deg) rotateY(0deg);
                    }
                    50% {
                        transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
                    }
                }
                /* Fade slide with depth */
                @keyframes fade-slide3D {
                    0% {
                        transform: translateY(20px) translateZ(-20px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0) translateZ(0);
                        opacity: 1;
                    }
                }
                /* Wobble 3D hover */
                @keyframes wobble3D {
                    0%, 100% {
                        transform: rotate(0deg);
                    }
                    25% {
                        transform: rotate(2deg) scale(1.02);
                    }
                    75% {
                        transform: rotate(-2deg) scale(1.02);
                    }
                }
                .animate-float3D {
                    animation: float3D 5s ease-in-out infinite;
                }
                .animate-fade-slide3D {
                    animation: fade-slide3D 0.8s ease forwards;
                }
                .hover\\:animate-wobble3D:hover {
                    animation: wobble3D 0.5s ease-in-out;
                }
                .text-shadow-sm {
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }
                .text-shadow-md {
                    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
            `}</style>
        </div>
    );
}

export function RootPageWrapper({ children }: { children: React.ReactNode }) {
    return <DashboardSharedProvider>{children}</DashboardSharedProvider>;
}

Home.getLayout = function getLayout(page: React.ReactNode) {
    return <RootPageWrapper>{page}</RootPageWrapper>;
};
