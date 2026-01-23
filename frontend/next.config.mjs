/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        }
        return config
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:5002/api/:path*',
            },
        ];
    },
};

export default nextConfig;
