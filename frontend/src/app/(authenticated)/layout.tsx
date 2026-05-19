import { PageTitleProvider } from '@/providers/page-title-context';
import { AppHeader } from '@/shared/components/app-header';
import { AppSidebar } from '@/shared/components/app-sidebar';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTitleProvider>
            <div className="bg-background text-foreground flex h-screen overflow-hidden">
                <AppSidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>
        </PageTitleProvider>
    );
}
