'use client';

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
import { buildDomainContextQuery } from '@/shared/lib/domain-navigation';
import { getStixConfig, hexToRgba } from '@/shared/lib/stix';
import type { BaseCatalogFilters, ViewMode } from '@/shared/types/entity';
import type { TLP } from '@/shared/types/enums';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
    useAllCyberTabData,
    useCyberDomainCounts,
    useIntrusionSetsCyberTab,
    useMalwareCyberTab,
    useToolsCyberTab,
    useVulnerabilitiesCyberTab,
} from '../hooks/use-cyber-domain-tabs';
import type { CyberDomainTab } from '../types';

const TABS: { id: CyberDomainTab; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: domainConfig['cyber-domain'].icon },
    { id: 'malware', label: 'Malware', icon: entityConfig.malware.icon },
    { id: 'tools', label: 'Tools', icon: entityConfig.tool.icon },
    {
        id: 'vulnerabilities',
        label: 'Vulnerabilities',
        icon: entityConfig.vulnerability.icon,
    },
    {
        id: 'intrusion-sets',
        label: 'Intrusion Sets',
        icon: entityConfig['intrusion-set'].icon,
    },
];

const TAB_COLOR_MAP: Partial<Record<CyberDomainTab, string>> = {
    malware: getStixConfig('malware').color,
    tools: getStixConfig('tool').color,
    vulnerabilities: getStixConfig('vulnerability').color,
    'intrusion-sets': getStixConfig('intrusion-set').color,
};

const BASE_PATH_MAP: Record<string, string> = {
    malware: '/malware',
    tool: '/tools',
    vulnerability: '/vulnerabilities',
    'intrusion-set': '/intrusion-sets',
};

function AllTab() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useAllCyberTabData(page);
    const sourceTab = 'all';

    if (isLoading) return <LoadingState />;
    if (isError) return <CatalogErrorState />;

    const malware = data?.malware.data ?? [];
    const tools = data?.tools.data ?? [];
    const vulnerabilities = data?.vulnerabilities.data ?? [];
    const intrusionSets = data?.intrusionSets.data ?? [];
    const allItems = [
        ...malware,
        ...tools,
        ...vulnerabilities,
        ...intrusionSets,
    ];

    const totalPages = Math.max(
        data?.malware.meta.totalPages ?? 1,
        data?.tools.meta.totalPages ?? 1,
        data?.vulnerabilities.meta.totalPages ?? 1,
        data?.intrusionSets.meta.totalPages ?? 1,
    );

    if (allItems.length === 0) return <CatalogEmptyState />;

    return (
        <div className="space-y-2">
            {allItems.map((item) => (
                <EntityListRow
                    key={item.id}
                    entity={item}
                    basePath={BASE_PATH_MAP[item.entityType] ?? '/cyber-domain'}
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
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

interface EntityTabProps {
    onTlpChange: (tlp: TLP | undefined) => void;
}

function MalwareTab({ onTlpChange }: EntityTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useMalwareCyberTab({
        search,
        filters,
        page,
    });

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
            items={data?.data ?? []}
            totalItems={data?.meta.total ?? 0}
            page={page}
            totalPages={data?.meta.totalPages ?? 1}
            limit={data?.meta.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/malware"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'malware',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/malware"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'malware',
                    )}
                />
            )}
            entityLabel="malware samples"
        />
    );
}

function ToolsTab({ onTlpChange }: EntityTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useToolsCyberTab({
        search,
        filters,
        page,
    });

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
            items={data?.data ?? []}
            totalItems={data?.meta.total ?? 0}
            page={page}
            totalPages={data?.meta.totalPages ?? 1}
            limit={data?.meta.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/tools"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'tools',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/tools"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'tools',
                    )}
                />
            )}
            entityLabel="tools"
        />
    );
}

function VulnerabilitiesTab({ onTlpChange }: EntityTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useVulnerabilitiesCyberTab({
        search,
        filters,
        page,
    });

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
            items={data?.data ?? []}
            totalItems={data?.meta.total ?? 0}
            page={page}
            totalPages={data?.meta.totalPages ?? 1}
            limit={data?.meta.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/vulnerabilities"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'vulnerabilities',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/vulnerabilities"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'vulnerabilities',
                    )}
                />
            )}
            entityLabel="vulnerabilities"
        />
    );
}

function IntrusionSetsTab({ onTlpChange }: EntityTabProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<BaseCatalogFilters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const { data, isLoading, isError } = useIntrusionSetsCyberTab({
        search,
        filters,
        page,
    });

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
            items={data?.data ?? []}
            totalItems={data?.meta.total ?? 0}
            page={page}
            totalPages={data?.meta.totalPages ?? 1}
            limit={data?.meta.limit ?? 3}
            onPageChange={setPage}
            renderCard={(item) => (
                <EntityCard
                    entity={item}
                    basePath="/intrusion-sets"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'intrusion-sets',
                    )}
                />
            )}
            renderRow={(item) => (
                <EntityListRow
                    entity={item}
                    basePath="/intrusion-sets"
                    detailQueryParams={buildDomainContextQuery(
                        'cyber-domain',
                        'intrusion-sets',
                    )}
                />
            )}
            entityLabel="intrusion sets"
        />
    );
}

export function CyberDomainCatalog() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState<CyberDomainTab>(
        () => (searchParams.get('tab') as CyberDomainTab | null) ?? 'all',
    );

    const [malwareTlp, setMalwareTlp] = useState<TLP | undefined>();
    const [toolsTlp, setToolsTlp] = useState<TLP | undefined>();
    const [vulnerabilitiesTlp, setVulnerabilitiesTlp] = useState<
        TLP | undefined
    >();
    const [intrusionSetsTlp, setIntrusionSetsTlp] = useState<TLP | undefined>();

    const { data: counts } = useCyberDomainCounts({
        malwareTlp,
        toolsTlp,
        vulnerabilitiesTlp,
        intrusionSetsTlp,
    });
    const DomainIcon = domainConfig['cyber-domain'].icon;

    const TAB_COUNTS: Record<CyberDomainTab, number | undefined> = {
        all: counts?.all,
        malware: counts?.malware,
        tools: counts?.tools,
        vulnerabilities: counts?.vulnerabilities,
        'intrusion-sets': counts?.intrusionSets,
    };

    const handleTabChange = (tab: CyberDomainTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                        <DomainIcon className="text-primary size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Cyber Domain
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Explore malware, tools, vulnerabilities and
                            intrusion sets in one domain view.
                        </p>
                    </div>
                </div>
            </div>

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

            <div>
                {activeTab === 'all' && <AllTab />}
                {activeTab === 'malware' && (
                    <MalwareTab onTlpChange={setMalwareTlp} />
                )}
                {activeTab === 'tools' && (
                    <ToolsTab onTlpChange={setToolsTlp} />
                )}
                {activeTab === 'vulnerabilities' && (
                    <VulnerabilitiesTab onTlpChange={setVulnerabilitiesTlp} />
                )}
                {activeTab === 'intrusion-sets' && (
                    <IntrusionSetsTab onTlpChange={setIntrusionSetsTlp} />
                )}
            </div>
        </div>
    );
}
