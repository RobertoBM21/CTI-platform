import { QueryProvider } from '@/providers/query-provider';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
    variable: '--font-sans',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
    weight: ['400', '500'],
});

export const metadata: Metadata = {
    title: 'CTI Platform',
    description: 'Cyber Threat Intelligence Platform — MVP',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}
            >
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
