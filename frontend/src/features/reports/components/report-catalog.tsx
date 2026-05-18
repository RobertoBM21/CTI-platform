'use client';

import { CatalogFiltersPanel } from '@/shared/components/catalog-filters-panel';
import { EntityCard } from '@/shared/components/entity-card';
import { EntityCatalog } from '@/shared/components/entity-catalog';
import { EntityListRow } from '@/shared/components/entity-list-row';
import { useState } from 'react';
import { useReports } from '../hooks/use-reports';
import type { ReportFilters, ViewMode } from '../types';

export function ReportCatalog() {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<ReportFilters>({});

    const { data, isLoading, isError } = useReports(search, filters, page);

    const reports = data?.data ?? [];
    const meta = data?.meta;
    const totalReports = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const limit = meta?.limit ?? 3;

    return (
        <EntityCatalog
            title="Report Library"
            description="Analytical reports aggregating threat intelligence."
            search={search}
            onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
            }}
            viewMode={viewMode}
            onViewModeChange={(m) => {
                setViewMode(m);
                setPage(1);
            }}
            filtersOpen={filtersOpen}
            onFiltersToggle={() => setFiltersOpen((o) => !o)}
            filtersPanel={
                <CatalogFiltersPanel
                    filters={filters}
                    onFiltersChange={(f) => {
                        setFilters(f);
                        setPage(1);
                    }}
                    onClose={() => setFiltersOpen(false)}
                />
            }
            isLoading={isLoading}
            isError={isError}
            items={reports}
            totalItems={totalReports}
            page={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={setPage}
            renderCard={(report) => (
                <EntityCard
                    key={report.id}
                    entity={report}
                    basePath="/reports"
                />
            )}
            renderRow={(report) => (
                <EntityListRow
                    key={report.id}
                    entity={report}
                    basePath="/reports"
                />
            )}
            entityLabel="reports"
        />
    );
}
