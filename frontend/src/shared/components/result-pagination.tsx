'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ResultPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

function getVisiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 'ellipsis', totalPages] as const;
    }

    if (currentPage >= totalPages - 2) {
        return [
            1,
            'ellipsis',
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ] as const;
    }

    return [1, 'ellipsis', currentPage, 'ellipsis-2', totalPages] as const;
}

export function ResultPagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: ResultPaginationProps) {
    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <div
            className={cn(
                'border-border/60 flex justify-center border-t pt-6',
                className,
            )}
        >
            <nav
                className="flex flex-wrap items-center gap-2"
                aria-label="Results pagination"
            >
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-border bg-card text-foreground/75 hover:bg-muted disabled:text-muted-foreground/50 disabled:hover:bg-card flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" />
                    Previous
                </button>

                {pages.map((page) => {
                    if (typeof page !== 'number') {
                        return (
                            <span
                                key={page}
                                className="text-muted-foreground flex h-10 w-10 items-center justify-center"
                            >
                                <MoreHorizontal className="size-4" />
                            </span>
                        );
                    }

                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                'border-border bg-card hover:bg-muted text-foreground/78 flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors',
                                isActive &&
                                    'bg-primary text-primary-foreground border-primary hover:bg-primary shadow-sm',
                            )}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={`Page ${page}`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-border bg-card text-foreground/75 hover:bg-muted disabled:text-muted-foreground/50 disabled:hover:bg-card flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight className="size-4" />
                </button>
            </nav>
        </div>
    );
}
