import Link from 'next/link';

export default function Home() {
  return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to Secure Note</h1>
        <p className="mt-4">
          Please <Link href="/login" className="text-blue-500">login</Link> or{' '}
          <Link href="/register" className="text-blue-500">register</Link> to start.
        </p>
      </div>
  );
}