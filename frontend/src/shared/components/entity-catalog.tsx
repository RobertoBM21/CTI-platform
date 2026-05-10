'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react';
import type React from 'react';
import type { ViewMode } from '../types/entity';
import { CatalogEmptyState, CatalogErrorState } from './error-state';
import { LoadingState } from './loading-state';
import { ResultPagination } from './result-pagination';
import { SlidingToggle } from './sliding-toggle';

// ── View-mode toggle options ───────────────────────────────────────────

const VIEW_MODE_OPTIONS = [
    { value: 'list' as const, icon: List, label: 'List view' },
    { value: 'grid' as const, icon: LayoutGrid, label: 'Grid view' },
] satisfies [
    { value: 'list'; icon: typeof List; label: string },
    { value: 'grid'; icon: typeof LayoutGrid; label: string },
];

// ── Props ──────────────────────────────────────────────────────────────

interface EntityCatalogProps<T> {
    /** Catalog page heading */
    title: string;
    /** Catalog page subheading */
    description?: string;

    /** Controlled search value */
    search: string;
    onSearchChange: (value: string) => void;

    /** Controlled view mode */
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;

    /** Controlled filters panel open state */
    filtersOpen: boolean;
    onFiltersToggle: () => void;
    /** Optional filter panel slot (feature-specific) */
    filtersPanel?: React.ReactNode;

    // ── Data ────────────────────────────────────────────────────────────
    isLoading: boolean;
    isError: boolean;
    items: T[];
    totalItems: number;

    // ── Pagination ──────────────────────────────────────────────────────
    page: number;
    totalPages: number;
    limit: number;
    onPageChange: (page: number) => void;

    // ── Render props ────────────────────────────────────────────────────
    renderCard: (item: T, index: number) => React.ReactNode;
    renderRow: (item: T, index: number) => React.ReactNode;

    /** Noun used in status messages, e.g. "incidents" */
    entityLabel?: string;
    /** Placeholder text for the search input */
    searchPlaceholder?: string;
}

// ── Component ──────────────────────────────────────────────────────────

export function EntityCatalog<T>({
    title,
    description,
    search,
    onSearchChange,
    viewMode,
    onViewModeChange,
    filtersOpen,
    onFiltersToggle,
    filtersPanel,
    isLoading,
    isError,
    items,
    totalItems,
    page,
    totalPages,
    limit,
    onPageChange,
    renderCard,
    renderRow,
    entityLabel = 'results',
    searchPlaceholder = 'Search by title, keyword or author...',
}: EntityCatalogProps<T>) {
    const visibleStart = totalItems === 0 ? 0 : (page - 1) * limit + 1;
    const visibleEnd = Math.min(page * limit, totalItems);

    return (
        <div className="animate-in fade-in flex-1 px-6 pb-10 duration-300 lg:px-12">
            <div className="mx-auto max-w-6xl">
                {/* ── Heading ──────────────────────────────────── */}
                <div className="mt-4 mb-10">
                    <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-foreground/60 mt-2">{description}</p>
                    )}
                </div>

                {/* ── Controls bar ─────────────────────────────── */}
                <div
                    className={cn(
                        'bg-card flex flex-col gap-2 rounded-2xl border border-white p-2 shadow-sm md:flex-row md:items-center',
                        'mb-8',
                    )}
                >
                    <div className="relative flex-1">
                        <Search className="text-foreground/40 pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="text-foreground placeholder:text-foreground/40 w-full bg-transparent py-3.5 pr-4 pl-12 text-sm focus:ring-0 focus:outline-none"
                        />
                    </div>

                    <div className="bg-border mx-2 my-auto hidden h-8 w-px md:block" />

                    <div className="flex items-center gap-2 overflow-x-auto pr-2 pb-2 md:pb-0">
                        <Button
                            variant={filtersOpen ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={onFiltersToggle}
                            className="h-10 rounded-xl px-3.5 text-[0.8rem] font-semibold shadow-none"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            Filters
                        </Button>

                        <SlidingToggle
                            options={VIEW_MODE_OPTIONS}
                            value={viewMode}
                            onChange={onViewModeChange}
                        />
                    </div>
                </div>

                {/* ── Filters panel ────────────────────────────── */}
                {filtersOpen && filtersPanel && (
                    <div className="-mt-4 mb-8">{filtersPanel}</div>
                )}

                {/* ── Content ──────────────────────────────────── */}
                {isLoading ? (
                    <LoadingState message={`Loading ${entityLabel}…`} />
                ) : isError ? (
                    <CatalogErrorState
                        message={`Failed to load ${entityLabel}. Check your connection and try again.`}
                    />
                ) : totalItems === 0 ? (
                    <CatalogEmptyState
                        message={`No ${entityLabel} found. Try adjusting your filters or search query.`}
                    />
                ) : (
                    <>
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <p className="text-foreground/60 text-sm font-medium">
                                Showing{' '}
                                <span className="text-foreground text-base font-semibold">
                                    {totalItems.toLocaleString()}
                                </span>{' '}
                                {entityLabel}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {visibleStart}-{visibleEnd} of {totalItems}
                            </p>
                        </div>

                        {viewMode === 'list' ? (
                            <div className="flex flex-col gap-5">
                                {items.map((item, i) => renderRow(item, i))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {items.map((item, i) => renderCard(item, i))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <ResultPagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                                className="mt-8"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
