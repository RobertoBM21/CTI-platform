import { AuthProvider } from '@/providers/auth-context';
import { QueryProvider } from '@/providers/query-provider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
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
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
                    }}
                />
            </head>
            <body className="selection:bg-primary/20 antialiased">
                <QueryProvider>
                    <AuthProvider>{children}</AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
