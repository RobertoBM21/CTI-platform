'use client';

import { CatalogFiltersPanel } from '@/shared/components/catalog-filters-panel';
import { EntityCard } from '@/shared/components/entity-card';
import { EntityCatalog } from '@/shared/components/entity-catalog';
import { EntityListRow } from '@/shared/components/entity-list-row';
import { useState } from 'react';
import {
    THREAT_ACTORS_PAGE_SIZE,
    useThreatActors,
} from '../hooks/use-threat-actors';
import type { ThreatActorFilters, ViewMode } from '../types';

export function ThreatActorCatalog() {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<ThreatActorFilters>({});

    const { data, isLoading, isError } = useThreatActors(search, filters, page);

    const actors = data?.data ?? [];
    const meta = data?.meta;
    const totalActors = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const limit = meta?.limit ?? THREAT_ACTORS_PAGE_SIZE;

    return (
        <EntityCatalog
            title="Threat Actor Registry"
            description="Track and analyze threat actors across campaigns and incidents."
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
            items={actors}
            totalItems={totalActors}
            page={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={setPage}
            renderCard={(actor) => (
                <EntityCard
                    key={actor.id}
                    entity={actor}
                    basePath="/threat-actors"
                />
            )}
            renderRow={(actor) => (
                <EntityListRow
                    key={actor.id}
                    entity={actor}
                    basePath="/threat-actors"
                />
            )}
            entityLabel="threat actors"
        />
    );
}
