'use client';

import { ResultPagination } from '@/shared/components/result-pagination';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { useIncidents } from '../hooks/use-incidents';
import type { IncidentFilters, ViewMode } from '../types';
import { IncidentCard } from './incident-card';
import { IncidentFiltersBar } from './incident-filters-bar';
import { IncidentFiltersPanel } from './incident-filters-panel';
import { IncidentListRow } from './incident-list-row';

export function IncidentCatalog() {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<IncidentFilters>({});

    const { data, isLoading, isError } = useIncidents(search, filters, page);

    const incidents = data?.data ?? [];
    const meta = data?.meta;
    const totalIncidents = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const visibleStart =
        totalIncidents === 0 ? 0 : (page - 1) * (meta?.limit ?? 3) + 1;
    const visibleEnd = Math.min(page * (meta?.limit ?? 3), totalIncidents);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        setPage(1);
    };

    const handleFiltersChange = (nextFilters: IncidentFilters) => {
        setFilters(nextFilters);
        setPage(1);
    };

    return (
        <div className="animate-in fade-in flex-1 px-6 pb-10 duration-300 lg:px-12">
            <div className="mx-auto max-w-6xl">
                {/* Title */}
                <div className="mt-4 mb-10">
                    <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                        Intelligence Library
                    </h1>
                    <p className="text-foreground/60 mt-2">
                        Manage and analyze platform incidents.
                    </p>
                </div>

                {/* Controls Bar */}
                <IncidentFiltersBar
                    search={search}
                    onSearchChange={handleSearchChange}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    filtersOpen={filtersOpen}
                    onFiltersToggle={() => setFiltersOpen(!filtersOpen)}
                    className="mb-8"
                />

                {/* Filters panel (collapsible) */}
                {filtersOpen && (
                    <IncidentFiltersPanel
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClose={() => setFiltersOpen(false)}
                        className="-mt-4 mb-8"
                    />
                )}

                {/* Results */}
                {isLoading ? (
                    <div className="py-24 text-center">
                        <Loader2 className="text-foreground/30 mx-auto mb-4 size-10 animate-spin" />
                        <p className="text-foreground/50 text-sm">
                            Loading incidents…
                        </p>
                    </div>
                ) : isError ? (
                    <div className="py-24 text-center">
                        <div className="bg-card border-card mx-auto mb-6 flex size-20 items-center justify-center rounded-full border shadow-sm">
                            <Search className="text-foreground/20 size-8" />
                        </div>
                        <h3 className="text-lg font-bold">
                            Failed to load incidents
                        </h3>
                        <p className="text-foreground/50 mt-2">
                            Check your connection and try again.
                        </p>
                    </div>
                ) : totalIncidents === 0 ? (
                    <div className="py-24 text-center">
                        <div className="bg-card border-card mx-auto mb-6 flex size-20 items-center justify-center rounded-full border shadow-sm">
                            <Search className="text-foreground/20 size-8" />
                        </div>
                        <h3 className="text-lg font-bold">No reports found</h3>
                        <p className="text-foreground/50 mt-2">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <p className="text-foreground/60 text-sm font-medium">
                                Showing{' '}
                                <span className="text-foreground text-base font-semibold">
                                    {totalIncidents.toLocaleString()}
                                </span>{' '}
                                incidents
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {visibleStart}-{visibleEnd} of {totalIncidents}
                            </p>
                        </div>

                        {viewMode === 'list' ? (
                            <div className="flex flex-col gap-5">
                                {incidents.map((incident) => (
                                    <IncidentListRow
                                        key={incident.id}
                                        incident={incident}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {incidents.map((incident) => (
                                    <IncidentCard
                                        key={incident.id}
                                        incident={incident}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <ResultPagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                className="mt-8"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
