'use client';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        document.title = 'Home | Secure Note';
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 text-center w-full max-w-md mx-auto my-12">
            <LockClosedIcon className="h-28 w-28 mx-auto text-gray-400 dark:text-gray-500" />
            <h1 className="text-4xl font-bold tracking-wide text-gray-900 dark:text-gray-100 mt-4">
                Welcome to Secure Note
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                Your private space for notes and ideas.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                    href="/login"
                    className="bg-slate-400 dark:bg-slate-600 text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200 text-base"
                >
                    Login
                </Link>
                <Link
                    href="/register"
                    className="bg-slate-400 dark:bg-slate-600 text-gray-900 dark:text-gray-100 px-5 py-2.5 rounded hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200 text-base"
                >
                    Register
                </Link>
            </div>
        </div>
    );
}