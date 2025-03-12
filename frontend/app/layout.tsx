import '@/app/globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import React from "react";
import { HomeIcon, KeyIcon, UserIcon, Squares2X2Icon, LockClosedIcon } from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Secure Note',
    description: 'A secure note-taking application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 min-h-screen`}>
        {/* Navigation Bar */}
        <nav className="bg-gray-800 dark:bg-gray-700 p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                {/* Branding */}
                <div className="flex items-center text-gray-100 text-2xl font-bold animate-fadeIn">
                    <LockClosedIcon className="h-6 w-6 mr-2 text-gray-400 animate-bounce" />
                    Secure Note
                </div>
                {/* Navigation Links */}
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/" className="flex items-center text-gray-100 hover:bg-gray-600 dark:hover:bg-gray-500 px-3 py-2 rounded-md transition duration-200">
                            <HomeIcon className="h-5 w-5 mr-1" />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/login" className="flex items-center text-gray-100 hover:bg-gray-600 dark:hover:bg-gray-500 px-3 py-2 rounded-md transition duration-200">
                            <KeyIcon className="h-5 w-5 mr-1" />
                            <span>Login</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/register" className="flex items-center text-gray-100 hover:bg-gray-600 dark:hover:bg-gray-500 px-3 py-2 rounded-md transition duration-200">
                            <UserIcon className="h-5 w-5 mr-1" />
                            <span>Register</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard" className="flex items-center text-gray-100 hover:bg-gray-600 dark:hover:bg-gray-500 px-3 py-2 rounded-md transition duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-1" />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="p-8">
            <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 p-8 rounded-lg animate-fadeIn text-gray-900 dark:text-gray-100">
                {children}
            </div>
        </main>
        </body>
        </html>
    );
}