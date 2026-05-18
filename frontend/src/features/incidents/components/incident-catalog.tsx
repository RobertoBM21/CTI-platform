'use client';

import { CatalogFiltersPanel } from '@/shared/components/catalog-filters-panel';
import { EntityCard } from '@/shared/components/entity-card';
import { EntityCatalog } from '@/shared/components/entity-catalog';
import { EntityListRow } from '@/shared/components/entity-list-row';
import { useState } from 'react';
import { useIncidents } from '../hooks/use-incidents';
import type { IncidentFilters, ViewMode } from '../types';

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
    const limit = meta?.limit ?? 3;

    return (
        <EntityCatalog
            title="Incident Library"
            description="Manage and analyze platform incidents."
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
            items={incidents}
            totalItems={totalIncidents}
            page={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={setPage}
            renderCard={(incident) => (
                <EntityCard
                    key={incident.id}
                    entity={incident}
                    basePath="/incidents"
                />
            )}
            renderRow={(incident) => (
                <EntityListRow
                    key={incident.id}
                    entity={incident}
                    basePath="/incidents"
                />
            )}
            entityLabel="incidents"
        />
    );
}
