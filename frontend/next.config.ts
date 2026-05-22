import type { NextConfig } from 'next';
import { resolve } from 'path';

const nextConfig: NextConfig = {
    reactCompiler: true,
    output: 'standalone',
    turbopack: {
        root: resolve(__dirname, '..'),
    },
    async redirects() {
        return [
            {
                source: '/',
                has: [
                    {
                        type: 'cookie',
                        key: 'auth_token',
                    },
                ],
                destination: '/home',
                permanent: false,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env['API_URL'] ?? 'http://localhost:3000'}/:path*`,
            },
        ];
    },
};

export default nextConfig;
