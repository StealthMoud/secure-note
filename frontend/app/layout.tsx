import '@/app/globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Secure Note App',
    description: 'A secure note-taking application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <nav className="bg-gray-800 p-4">
            <ul className="flex space-x-4 text-white">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/register">Register</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
        </nav>
        <main className="p-4">{children}</main>
        </body>
        </html>
    );
}