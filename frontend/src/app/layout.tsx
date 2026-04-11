import { QueryProvider } from '@/providers/query-provider';
import { AppHeader } from '@/shared/components/app-header';
import { AppSidebar } from '@/shared/components/app-sidebar';
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
                    <div className="bg-background text-foreground flex h-screen overflow-hidden">
                        <AppSidebar />
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <AppHeader />
                            <main className="flex-1 overflow-y-auto">
                                {children}
                            </main>
                        </div>
                    </div>
                </QueryProvider>
            </body>
        </html>
    );
}
