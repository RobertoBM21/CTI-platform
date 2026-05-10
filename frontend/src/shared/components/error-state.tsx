'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface CatalogErrorStateProps {
    message?: string;
}

export function CatalogErrorState({
    message = 'Check your connection and try again.',
}: CatalogErrorStateProps) {
    return (
        <div className="py-24 text-center">
            <div className="bg-card border-card mx-auto mb-6 flex size-20 items-center justify-center rounded-full border shadow-sm">
                <Search className="text-foreground/20 size-8" />
            </div>
            <h3 className="text-lg font-bold">Failed to load</h3>
            <p className="text-foreground/50 mt-2">{message}</p>
        </div>
    );
}

interface CatalogEmptyStateProps {
    message?: string;
}

export function CatalogEmptyState({
    message = 'Try adjusting your filters or search query.',
}: CatalogEmptyStateProps) {
    return (
        <div className="py-24 text-center">
            <div className="bg-card border-card mx-auto mb-6 flex size-20 items-center justify-center rounded-full border shadow-sm">
                <Search className="text-foreground/20 size-8" />
            </div>
            <h3 className="text-lg font-bold">No results found</h3>
            <p className="text-foreground/50 mt-2">{message}</p>
        </div>
    );
}

interface DetailErrorStateProps {
    message?: string;
    backPath?: string;
    backLabel?: string;
}

export function DetailErrorState({
    message = 'Failed to load the requested item.',
    backPath,
    backLabel = 'Back to catalog',
}: DetailErrorStateProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full text-2xl font-bold">
                !
            </div>
            <p className="font-semibold">Not found</p>
            <p className="text-foreground/50 text-sm">{message}</p>
            {backPath && (
                <Link href={backPath}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 size-4" />
                        {backLabel}
                    </Button>
                </Link>
            )}
        </div>
    );
}

interface DetailLoadingStateProps {
    message?: string;
}

export function DetailLoadingState({
    message = 'Loading…',
}: DetailLoadingStateProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <div className="border-primary size-10 animate-spin rounded-full border-2 border-t-transparent" />
            <p className="text-foreground/50 text-sm">{message}</p>
        </div>
    );
}
