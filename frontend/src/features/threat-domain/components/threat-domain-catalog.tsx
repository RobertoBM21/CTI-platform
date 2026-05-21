'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CatalogFiltersPanel } from '@/shared/components/catalog-filters-panel';
import { EntityCard } from '@/shared/components/entity-card';
import { EntityCatalog } from '@/shared/components/entity-catalog';
import { EntityListRow } from '@/shared/components/entity-list-row';
import {
    domainConfig,
    entityConfig,
} from '@/shared/components/entity-type-badge';
import {
    CatalogEmptyState,
    CatalogErrorState,
} from '@/shared/components/error-state';
import { LoadingState } from '@/shared/components/loading-state';
import { ResultPagination } from '@/shared/components/result-pagination';
import { TlpBadge } from '@/shared/components/tlp-badge';
import { buildDomainContextQuery } from '@/shared/lib/domain-navigation';
import { getStixConfig, hexToRgba } from '@/shared/lib/stix';
import type { BaseCatalogFilters, ViewMode } from '@/shared/types/entity';
import type { TLP } from '@/shared/types/enums';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Crosshair, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
    useAllTabData,
    useAttackPatternsTab,
    useCampaignsTab,
    useIncidentsTab,
    useIntrusionSetsDropdown,
    useThreatActorsTab,
    useThreatDomainCounts,
} from '../hooks/use-threat-domain-tabs';
import type {
    AttackPatternItem,
    SelectedAttackPattern,
    ThreatDomainTab,
} from '../types';

// ── Tab definitions ────────────────────────────────────────────────────

const TABS: { id: ThreatDomainTab; label: string; icon: React.ElementType }[] =
    [
        { id: 'all', label: 'All', icon: domainConfig['threat-domain'].icon },
        {
            id: 'incidents',
            label: 'Incidents',
            icon: entityConfig.incident.icon,
        },
        {
            id: 'campaigns',
            label: 'Campaigns',
            icon: entityConfig.campaign.icon,
        },
        {
            id: 'threat-actors',
            label: 'Threat Actors',
            icon: entityConfig['threat-actor'].icon,
        },
        {
            id: 'attack-patterns',
            label: 'Attack Patterns',
            icon: entityConfig['attack-pattern'].icon,
        },
    ];

const TAB_COLOR_MAP: Partial<Record<ThreatDomainTab, string>> = {
    incidents: getStixConfig('incident').color,
    campaigns: getStixConfig('campaign').color,
    'threat-actors': getStixConfig('threat-actor').color,
    'attack-patterns': getStixConfig('attack-pattern').color,
};

// ── Attack Pattern filter chip ─────────────────────────────────────────

interface FilterChipProps {
    pattern: SelectedAttackPattern;
    onClear: () => void;
}

function AttackPatternFilterChip({ pattern, onClear }: FilterChipProps) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/50 dark:text-rose-300">
            <Crosshair className="size-3" />
            <span>Attack Pattern: {pattern.name}</span>
            <button
                onClick={onClear}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-rose-200 dark:hover:bg-rose-800"
                aria-label="Clear attack pattern filter"
            >
                <X className="size-3" />
            </button>
        </div>
    );
}

// ── Attack Patterns Table ──────────────────────────────────────────────

const columnHelper = createColumnHelper<AttackPatternItem>();

const attackPatternColumns = [
    columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
            <span className="text-foreground font-medium">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor('killChainPhases', {
        header: 'Kill Chain Phases',
        cell: (info) => {
            const phases = info.getValue();
            if (!phases.length)
                return <span className="text-muted-foreground">—</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {phases.map((p, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.68rem] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            {p.phaseName}
                        </span>
                    ))}
                </div>
            );
        },
    }),
    columnHelper.accessor('externalReference', {
        header: 'ATT&CK ID',
        cell: (info) =>
            info.getValue() ? (
                <span className="text-foreground/70 font-mono text-xs">
                    {info.getValue()}
                </span>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    }),
    columnHelper.accessor('tlp', {
        header: 'TLP',
        cell: (info) => <TlpBadge tlp={info.getValue()} />,
    }),
];

interface AttackPatternsTableProps {
    data: AttackPatternItem[];
    selectedId?: string;
    onRowClick: (pattern: AttackPatternItem) => void;
}

function AttackPatternsTable({
    data,
    selectedId,
    onRowClick,
}: AttackPatternsTableProps) {
    'use no memo';
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns: attackPatternColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="border-border bg-card overflow-x-auto rounded-2xl border shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr
                            key={hg.id}
                            className="border-border bg-muted/40 border-b"
                        >
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="text-foreground/60 px-4 py-3 text-left text-xs font-bold tracking-wide uppercase"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => {
                        const isSelected = row.original.id === selectedId;
                        return (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick(row.original)}
                                className={cn(
                                    'border-border/50 cursor-pointer border-b transition-colors last:border-0',
                                    isSelected
                                        ? 'bg-rose-50 dark:bg-rose-950/30'
                                        : 'hover:bg-muted/30',
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ── All Tab ────────────────────────────────────────────────────────────

const BASE_PATH_MAP: Record<string, string> = {
    incident: '/incidents',
    campaign: '/campaigns',
    'threat-actor': '/threat-actors',
};

interface AllTabProps {
    attackPatternId?: string;
}

function AllTab({ attackPatternId }: AllTabProps) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useAllTabData({
        attackPatternId,
        page,
    });
    const sourceTab = 'all';

    if (isLoading) return <LoadingState />;
    if (isError) return <CatalogErrorState />;

    const incidents = data?.incidents.data ?? [];
    const campaigns = data?.campaigns.data ?? [];
    const threatActors = data?.threatActors.data ?? [];
    const allItems = [...incidents, ...campaigns, ...threatActors];

    const totalPages = Math.max(
        data?.incidents.meta.totalPages ?? 1,
        data?.campaigns.meta.totalPages ?? 1,
        data?.threatActors.meta.totalPages ?? 1,
    );

    if (allItems.length === 0) return <CatalogEmptyState />;

    return (
        <div className="space-y-2">
            {allItems.map((item) => (
                <EntityListRow
                    key={item.id}
                    entity={item}
                    basePath={BASE_PATH_MAP[item.entityType] ?? '/incidents'}
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        sourceTab,
                    )}
                />
            ))}
            {totalPages > 1 && (
                <ResultPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}

// ── Incidents Tab ──────────────────────────────────────────────────────

interface IncidentsTabProps {
    attackPatternId?: string;
    onTlpChange: (tlp: TLP | undefined) => void;
}

function IncidentsTab({ attackPatternId, onTlpChange }: IncidentsTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useIncidentsTab({
        search,
        filters,
        page,
        attackPatternId,
    });
    const items = data?.data ?? [];
    const meta = data?.meta;

    return (
        <EntityCatalog
            compact
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
                        onTlpChange(f.tlp);
                    }}
                    onClose={() => setFiltersOpen(false)}
                />
            }
            isLoading={isLoading}
            isError={isError}
            items={items}
            totalItems={meta?.total ?? 0}
            page={page}
            totalPages={meta?.totalPages ?? 1}
            limit={meta?.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/incidents"
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        'incidents',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/incidents"
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        'incidents',
                    )}
                />
            )}
            entityLabel="incidents"
        />
    );
}

// ── Campaigns Tab ──────────────────────────────────────────────────────

interface CampaignsTabProps {
    attackPatternId?: string;
    intrusionSetId?: string;
    onIntrusionSetChange: (id: string | undefined) => void;
    onTlpChange: (tlp: TLP | undefined) => void;
}

function CampaignsTab({
    attackPatternId,
    intrusionSetId,
    onIntrusionSetChange,
    onTlpChange,
}: CampaignsTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useCampaignsTab({
        search,
        filters,
        page,
        attackPatternId,
        intrusionSetId,
    });
    const { data: intrusionSetsData } = useIntrusionSetsDropdown();
    const items = data?.data ?? [];
    const meta = data?.meta;

    return (
        <EntityCatalog
            compact
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
                        onTlpChange(f.tlp);
                    }}
                    onClose={() => setFiltersOpen(false)}
                >
                    <IntrusionSetSection
                        intrusionSets={intrusionSetsData?.data ?? []}
                        value={intrusionSetId}
                        onChange={(v) => {
                            onIntrusionSetChange(v);
                            setPage(1);
                        }}
                    />
                </CatalogFiltersPanel>
            }
            isLoading={isLoading}
            isError={isError}
            items={items}
            totalItems={meta?.total ?? 0}
            page={page}
            totalPages={meta?.totalPages ?? 1}
            limit={meta?.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/campaigns"
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        'campaigns',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/campaigns"
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        'campaigns',
                    )}
                />
            )}
            entityLabel="campaigns"
        />
    );
}

// ── Threat Actors Tab ──────────────────────────────────────────────────

interface ThreatActorsTabProps {
    attackPatternId?: string;
    intrusionSetId?: string;
    onIntrusionSetChange: (id: string | undefined) => void;
    onTlpChange: (tlp: TLP | undefined) => void;
}

function ThreatActorsTab({
    attackPatternId,
    intrusionSetId,
    onIntrusionSetChange,
    onTlpChange,
}: ThreatActorsTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useThreatActorsTab({
        search,
        filters,
        page,
        attackPatternId,
        intrusionSetId,
    });
    const { data: intrusionSetsData } = useIntrusionSetsDropdown();
    const items = data?.data ?? [];
    const meta = data?.meta;

    return (
        <EntityCatalog
            compact
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
                        onTlpChange(f.tlp);
                    }}
                    onClose={() => setFiltersOpen(false)}
                >
                    <IntrusionSetSection
                        intrusionSets={intrusionSetsData?.data ?? []}
                        value={intrusionSetId}
                        onChange={(v) => {
                            onIntrusionSetChange(v);
                            setPage(1);
                        }}
                    />
                </CatalogFiltersPanel>
            }
            isLoading={isLoading}
            isError={isError}
            items={items}
            totalItems={meta?.total ?? 0}
            page={page}
            totalPages={meta?.totalPages ?? 1}
            limit={meta?.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/threat-actors"
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        'threat-actors',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/threat-actors"
                    detailQueryParams={buildDomainContextQuery(
                        'threat-domain',
                        'threat-actors',
                    )}
                />
            )}
            entityLabel="threat actors"
        />
    );
}

// ── Attack Patterns Tab ────────────────────────────────────────────────

interface AttackPatternsTabProps {
    selectedId?: string;
    onSelectPattern: (pattern: SelectedAttackPattern | null) => void;
    onTlpChange: (tlp: TLP | undefined) => void;
}

function AttackPatternsTabContent({
    selectedId,
    onSelectPattern,
    onTlpChange,
}: AttackPatternsTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);

    const { data, isLoading, isError } = useAttackPatternsTab({
        search,
        filters,
        page,
    });
    const items = data?.data ?? [];
    const meta = data?.meta;

    const handleRowClick = (pattern: AttackPatternItem) => {
        if (pattern.id === selectedId) {
            onSelectPattern(null);
        } else {
            onSelectPattern({ id: pattern.id, name: pattern.name });
        }
    };

    return (
        <div className="space-y-4">
            {/* Controls bar matching EntityCatalog compact style */}
            <div className="bg-card mb-8 flex flex-col gap-2 rounded-2xl border border-white p-2 shadow-sm md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground/40 pointer-events-none absolute top-1/2 left-2 size-9 -translate-y-1/2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </Button>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search attack patterns..."
                        className="text-foreground placeholder:text-foreground/40 w-full bg-transparent py-3.5 pr-4 pl-12 text-sm focus:ring-0 focus:outline-none"
                    />
                </div>
                <div className="bg-border mx-2 my-auto hidden h-8 w-px md:block" />
                <div className="flex items-center gap-2 pr-2 pb-2 md:pb-0">
                    <Button
                        variant={filtersOpen ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setFiltersOpen((o) => !o)}
                        className="h-10 rounded-xl px-3.5 text-[0.8rem] font-semibold shadow-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                        >
                            <line x1="4" x2="4" y1="21" y2="14" />
                            <line x1="4" x2="4" y1="10" y2="3" />
                            <line x1="12" x2="12" y1="21" y2="12" />
                            <line x1="12" x2="12" y1="8" y2="3" />
                            <line x1="20" x2="20" y1="21" y2="16" />
                            <line x1="20" x2="20" y1="12" y2="3" />
                            <line x1="1" x2="7" y1="14" y2="14" />
                            <line x1="9" x2="15" y1="12" y2="12" />
                            <line x1="17" x2="23" y1="16" y2="16" />
                        </svg>
                        Filters
                    </Button>
                </div>
            </div>
            {filtersOpen && (
                <div className="-mt-4 mb-8">
                    <CatalogFiltersPanel
                        filters={filters}
                        onFiltersChange={(f) => {
                            setFilters(f);
                            setPage(1);
                            onTlpChange(f.tlp);
                        }}
                        onClose={() => setFiltersOpen(false)}
                    />
                </div>
            )}
            {isLoading ? (
                <LoadingState />
            ) : isError ? (
                <CatalogErrorState />
            ) : items.length === 0 ? (
                <CatalogEmptyState />
            ) : (
                <>
                    <p className="text-muted-foreground mb-3 text-xs">
                        Click a row to filter other tabs by this attack pattern.
                    </p>
                    <AttackPatternsTable
                        data={items}
                        selectedId={selectedId}
                        onRowClick={handleRowClick}
                    />
                    {meta && meta.totalPages > 1 && (
                        <ResultPagination
                            currentPage={page}
                            totalPages={meta.totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// ── Intrusion Set filter section (used inside CatalogFiltersPanel) ─────

interface IntrusionSetSectionProps {
    intrusionSets: { id: string; name: string }[];
    value?: string;
    onChange: (value: string | undefined) => void;
}

function IntrusionSetSection({
    intrusionSets,
    value,
    onChange,
}: IntrusionSetSectionProps) {
    return (
        <div>
            <p className="text-foreground mb-3 text-sm font-bold">
                Intrusion Set
            </p>
            <Select
                value={value ?? ''}
                onValueChange={(v) => onChange(v || undefined)}
                disabled={intrusionSets.length === 0}
            >
                <SelectTrigger className="w-full">
                    <SelectValue
                        placeholder={
                            intrusionSets.length === 0
                                ? 'No intrusion sets available'
                                : 'All intrusion sets'
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All intrusion sets</SelectItem>
                    {intrusionSets.map((is) => (
                        <SelectItem key={is.id} value={is.id}>
                            {is.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

// ── Main ThreatDomainCatalog ───────────────────────────────────────────

export function ThreatDomainCatalog() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState<ThreatDomainTab>(
        () => (searchParams.get('tab') as ThreatDomainTab | null) ?? 'all',
    );
    const [selectedAttackPattern, setSelectedAttackPattern] =
        useState<SelectedAttackPattern | null>(() => {
            const id = searchParams.get('attackPatternId');
            const name = searchParams.get('attackPatternName');
            return id && name ? { id, name } : null;
        });
    const [campaignIntrusionSetId, setCampaignIntrusionSetId] = useState<
        string | undefined
    >();
    const [threatActorIntrusionSetId, setThreatActorIntrusionSetId] = useState<
        string | undefined
    >();

    // Per-tab TLP state lifted to parent for count reactivity
    const [incidentsTlp, setIncidentsTlp] = useState<TLP | undefined>();
    const [campaignsTlp, setCampaignsTlp] = useState<TLP | undefined>();
    const [threatActorsTlp, setThreatActorsTlp] = useState<TLP | undefined>();
    const [attackPatternsTlp, setAttackPatternsTlp] = useState<
        TLP | undefined
    >();

    const updateUrl = (
        tab: ThreatDomainTab,
        pattern: SelectedAttackPattern | null,
    ) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        if (pattern) {
            params.set('attackPatternId', pattern.id);
            params.set('attackPatternName', pattern.name);
        } else {
            params.delete('attackPatternId');
            params.delete('attackPatternName');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleTabChange = (tab: ThreatDomainTab) => {
        setActiveTab(tab);
        updateUrl(tab, selectedAttackPattern);
    };

    const handleSelectPattern = (pattern: SelectedAttackPattern | null) => {
        setSelectedAttackPattern(pattern);
        updateUrl(activeTab, pattern);
    };

    const attackPatternId = selectedAttackPattern?.id;
    const { data: counts } = useThreatDomainCounts({
        attackPatternId,
        campaignIntrusionSetId,
        threatActorIntrusionSetId,
        incidentsTlp,
        campaignsTlp,
        threatActorsTlp,
        attackPatternsTlp,
    });
    const DomainIcon = domainConfig['threat-domain'].icon;

    const TAB_COUNTS: Record<ThreatDomainTab, number | undefined> = {
        all: counts?.all,
        incidents: counts?.incidents,
        campaigns: counts?.campaigns,
        'threat-actors': counts?.threatActors,
        'attack-patterns': counts?.attackPatterns,
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                        <DomainIcon className="text-primary size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Threat Domain
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Explore incidents, campaigns, threat actors and
                            ATT&CK techniques.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active filter chip */}
            {selectedAttackPattern && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                        Active filter:
                    </span>
                    <AttackPatternFilterChip
                        pattern={selectedAttackPattern}
                        onClear={() => handleSelectPattern(null)}
                    />
                </div>
            )}

            {/* Tabs */}
            <div className="border-border border-b">
                <nav className="-mb-px flex gap-1 overflow-x-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const accent = TAB_COLOR_MAP[tab.id];
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                                    isActive
                                        ? accent
                                            ? ''
                                            : 'border-primary text-primary'
                                        : 'text-foreground/60 hover:border-foreground/20 hover:text-foreground border-transparent',
                                )}
                                style={
                                    isActive && accent
                                        ? {
                                              borderColor: accent,
                                              color: accent,
                                          }
                                        : undefined
                                }
                            >
                                <Icon className="size-4" />
                                {tab.label}
                                {TAB_COUNTS[tab.id] !== undefined && (
                                    <span
                                        className={cn(
                                            'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[0.65rem] font-bold tabular-nums',
                                            isActive
                                                ? accent
                                                    ? ''
                                                    : 'bg-primary/15 text-primary'
                                                : 'bg-foreground/10 text-foreground/50',
                                        )}
                                        style={
                                            isActive && accent
                                                ? {
                                                      backgroundColor:
                                                          hexToRgba(
                                                              accent,
                                                              0.12,
                                                          ),
                                                      color: accent,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {TAB_COUNTS[tab.id]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab content */}
            <div>
                {activeTab === 'all' && (
                    <AllTab attackPatternId={attackPatternId} />
                )}
                {activeTab === 'incidents' && (
                    <IncidentsTab
                        attackPatternId={attackPatternId}
                        onTlpChange={setIncidentsTlp}
                    />
                )}
                {activeTab === 'campaigns' && (
                    <CampaignsTab
                        attackPatternId={attackPatternId}
                        intrusionSetId={campaignIntrusionSetId}
                        onIntrusionSetChange={setCampaignIntrusionSetId}
                        onTlpChange={setCampaignsTlp}
                    />
                )}
                {activeTab === 'threat-actors' && (
                    <ThreatActorsTab
                        attackPatternId={attackPatternId}
                        intrusionSetId={threatActorIntrusionSetId}
                        onIntrusionSetChange={setThreatActorIntrusionSetId}
                        onTlpChange={setThreatActorsTlp}
                    />
                )}
                {activeTab === 'attack-patterns' && (
                    <AttackPatternsTabContent
                        selectedId={selectedAttackPattern?.id}
                        onSelectPattern={handleSelectPattern}
                        onTlpChange={setAttackPatternsTlp}
                    />
                )}
            </div>
        </div>
    );
}
