'use client';

import { CatalogFiltersPanel } from '@/shared/components/catalog-filters-panel';
import { EntityCard } from '@/shared/components/entity-card';
import { EntityCatalog } from '@/shared/components/entity-catalog';
import { EntityListRow } from '@/shared/components/entity-list-row';
import { useState } from 'react';
import { useCampaigns } from '../hooks/use-campaigns';
import type { CampaignFilters, ViewMode } from '../types';

export function CampaignCatalog() {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<CampaignFilters>({});

    const { data, isLoading, isError } = useCampaigns(search, filters, page);

    const campaigns = data?.data ?? [];
    const meta = data?.meta;
    const totalCampaigns = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const limit = meta?.limit ?? 3;

    return (
        <EntityCatalog
            title="Campaign Library"
            description="Manage and analyze threat campaigns."
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
            items={campaigns}
            totalItems={totalCampaigns}
            page={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={setPage}
            renderCard={(campaign) => (
                <EntityCard
                    key={campaign.id}
                    entity={campaign}
                    basePath="/campaigns"
                />
            )}
            renderRow={(campaign) => (
                <EntityListRow
                    key={campaign.id}
                    entity={campaign}
                    basePath="/campaigns"
                />
            )}
            entityLabel="campaigns"
        />
    );
}
