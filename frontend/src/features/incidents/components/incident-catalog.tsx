'use client';

import { ResultPagination } from '@/shared/components/result-pagination';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MOCK_INCIDENTS } from '../mock-data';
import type { IncidentFilters, ViewMode } from '../types';
import { IncidentCard } from './incident-card';
import { IncidentFiltersBar } from './incident-filters-bar';
import { IncidentFiltersPanel } from './incident-filters-panel';
import { IncidentListRow } from './incident-list-row';

const PAGE_SIZE = 3;

export function IncidentCatalog() {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<IncidentFilters>({});

    const filteredIncidents = useMemo(() => {
        let result = [...MOCK_INCIDENTS];

        // Text search
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(
                (i) =>
                    i.name.toLowerCase().includes(term) ||
                    i.description?.toLowerCase().includes(term) ||
                    i.createdBy.toLowerCase().includes(term),
            );
        }

        // TLP filter
        if (filters.tlp) {
            result = result.filter((i) => i.tlp === filters.tlp);
        }

        // Sorting
        const sortOrder = filters.sortOrder ?? 'desc';
        result.sort((a, b) => {
            const comparison =
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return result;
    }, [search, filters]);

    const totalIncidents = filteredIncidents.length;
    const totalPages = Math.max(1, Math.ceil(totalIncidents / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedIncidents = filteredIncidents.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const visibleStart =
        totalIncidents === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const visibleEnd = Math.min(currentPage * PAGE_SIZE, totalIncidents);

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
                {totalIncidents === 0 ? (
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
                                {paginatedIncidents.map((incident) => (
                                    <IncidentListRow
                                        key={incident.id}
                                        incident={incident}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {paginatedIncidents.map((incident) => (
                                    <IncidentCard
                                        key={incident.id}
                                        incident={incident}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <ResultPagination
                                currentPage={currentPage}
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
