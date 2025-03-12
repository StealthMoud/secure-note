import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center animate-fadeIn max-w-lg mx-4 my-8">
                <LockClosedIcon className="h-24 w-24 mx-auto text-gray-400 animate-bounce" />
                <h1 className="text-5xl font-bold tracking-wide mt-4 text-gray-900 dark:text-gray-100">Welcome to Secure Note</h1>
                <p className="mt-4 text-lg text-gray-900 dark:text-gray-100">Your private space for notes and ideas.</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link href="/login" className="bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 px-4 py-2 rounded hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200">
                        Login
                    </Link>
                    <Link href="/register" className="bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 px-4 py-2 rounded hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}