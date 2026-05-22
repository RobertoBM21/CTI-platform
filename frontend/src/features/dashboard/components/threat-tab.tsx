'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    EntityTypeBadge,
    entityConfig,
} from '@/shared/components/entity-type-badge';
import { NetworkGraphTab } from '@/shared/components/tabs/network-graph-tab';
import {
    formatDate as formatStixDate,
    getStixConfig,
    getStixType,
} from '@/shared/lib/stix';
import type { CatalogEntity, StixObject } from '@/shared/types/entity';
import { Activity, Globe, Info, MapPin, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import MapLibreMap, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import {
    useAllCampaignsForSelect,
    useAllIncidentsForSelect,
    useAllThreatActorsForSelect,
    useDashboardCampaigns,
    useDashboardIncidents,
    useDashboardThreatActors,
    useLocations,
    useSelectedCampaignDetail,
    useSelectedIncidentDetail,
    useSelectedThreatActorDetail,
} from '../hooks/use-dashboard';
import type { LocationItem } from '../types';

// ── Constants ──────────────────────────────────────────────────────────

const CARTO_LIGHT =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const SELECT_TRIGGER_CLASS =
    'bg-card text-foreground hover:bg-card/95 h-11 w-full border shadow-sm transition-colors';
const SELECT_CONTENT_CLASS = 'bg-card border shadow-lg';

function getSelectWidth(options: { name: string }[], placeholder: string) {
    const maxLabelLength = options.reduce(
        (max, option) => Math.max(max, option.name.length),
        placeholder.length,
    );
    const widthInCh = Math.min(Math.max(maxLabelLength + 6, 24), 38);
    return `${widthInCh}ch`;
}

// ── Quick entity table ─────────────────────────────────────────────────

interface QuickTableProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    entities: CatalogEntity[];
    total: number;
    page: number;
    onPageChange: (p: number) => void;
    loading?: boolean;
    selectedId?: string | null;
    onSelect?: (id: string, name: string) => void;
}

function QuickTable({
    title,
    icon: Icon,
    entities,
    total,
    page,
    onPageChange,
    loading = false,
    selectedId,
    onSelect,
}: QuickTableProps) {
    const totalPages = Math.ceil(total / 5);

    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Icon className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">{title}</span>
                    <span className="text-foreground/40 ml-auto text-xs tabular-nums">
                        {total} total
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
                    </div>
                ) : entities.length === 0 ? (
                    <div className="text-foreground/40 flex h-20 items-center justify-center text-xs italic">
                        No data
                    </div>
                ) : (
                    <>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-muted/30 border-b">
                                    <th className="text-foreground/50 px-4 py-2 text-left font-semibold tracking-wider uppercase">
                                        Name
                                    </th>
                                    <th className="text-foreground/50 px-4 py-2 text-left font-semibold tracking-wider uppercase">
                                        Type
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {entities.map((e) => (
                                    <tr
                                        key={e.id}
                                        onClick={() => onSelect?.(e.id, e.name)}
                                        className={`cursor-pointer transition-colors ${
                                            selectedId === e.id
                                                ? 'bg-primary/10'
                                                : 'hover:bg-muted/40'
                                        }`}
                                    >
                                        <td className="max-w-30 truncate px-4 py-2.5 font-medium">
                                            {e.name}
                                        </td>
                                        <td className="text-foreground/60 px-4 py-2.5">
                                            <EntityTypeBadge
                                                entityType={e.entityType}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-2">
                                <button
                                    onClick={() =>
                                        onPageChange(Math.max(1, page - 1))
                                    }
                                    disabled={page <= 1}
                                    className="text-foreground/60 hover:text-foreground text-xs disabled:opacity-30"
                                >
                                    ← Prev
                                </button>
                                <span className="text-foreground/50 text-xs">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() =>
                                        onPageChange(
                                            Math.min(totalPages, page + 1),
                                        )
                                    }
                                    disabled={page >= totalPages}
                                    className="text-foreground/60 hover:text-foreground text-xs disabled:opacity-30"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ── Entity info card ───────────────────────────────────────────────────

interface InfoRow {
    label: string;
    value: string | undefined | null;
}

interface EntityInfoCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    rows: InfoRow[];
    loading?: boolean;
    empty?: boolean;
}

function EntityInfoCard({
    title,
    icon: Icon,
    rows,
    loading = false,
    empty = false,
}: EntityInfoCardProps) {
    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Icon className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">{title}</span>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                {loading ? (
                    <div className="flex h-24 items-center justify-center">
                        <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
                    </div>
                ) : empty ? (
                    <div className="text-foreground/40 flex h-20 items-center justify-center gap-2 text-xs italic">
                        <Info className="size-3.5" />
                        <span>Select an entity to view details</span>
                    </div>
                ) : (
                    <dl className="divide-y">
                        {rows
                            .filter((r) => r.value)
                            .map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-start gap-3 py-2"
                                >
                                    <dt className="text-foreground/50 w-28 shrink-0 text-xs font-medium">
                                        {row.label}
                                    </dt>
                                    <dd className="text-foreground min-w-0 text-xs leading-relaxed wrap-break-word">
                                        {row.value}
                                    </dd>
                                </div>
                            ))}
                    </dl>
                )}
            </CardContent>
        </Card>
    );
}

// ── Filtered map ───────────────────────────────────────────────────────

interface FilteredMapProps {
    title: string;
    subtitle?: string;
    locations: LocationItem[];
    loading?: boolean;
}

function FilteredMap({
    title,
    subtitle,
    locations,
    loading = false,
}: FilteredMapProps) {
    const pins = useMemo(
        () =>
            locations.filter(
                (l) =>
                    typeof l.latitude === 'number' &&
                    typeof l.longitude === 'number',
            ),
        [locations],
    );

    return (
        <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <Globe className="text-foreground/50 size-4" />
                            <span className="text-sm font-semibold">
                                {title}
                            </span>
                        </div>
                        {subtitle && (
                            <p className="text-foreground/40 pl-6 text-[0.68rem] italic">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <span className="text-foreground/50 text-xs">
                        {pins.length} pin{pins.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex h-56 items-center justify-center">
                        <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
                    </div>
                ) : (
                    <div className="h-56 w-full">
                        <MapLibreMap
                            initialViewState={{
                                longitude: 10,
                                latitude: 25,
                                zoom: 1.2,
                            }}
                            style={{ width: '100%', height: '100%' }}
                            mapStyle={CARTO_LIGHT}
                            attributionControl={false}
                        >
                            <NavigationControl position="top-right" />
                            {pins.map((loc) => (
                                <Marker
                                    key={loc.id}
                                    longitude={loc.longitude!}
                                    latitude={loc.latitude!}
                                    anchor="bottom"
                                >
                                    <div className="group relative flex flex-col items-center">
                                        <div className="flex size-6 items-center justify-center rounded-full bg-[#3b82f6] shadow-lg transition-transform group-hover:scale-110">
                                            <MapPin className="size-3 text-white" />
                                        </div>
                                        <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-1.5 py-0.5 text-[0.6rem] whitespace-nowrap text-white shadow group-hover:block">
                                            {loc.name}
                                        </div>
                                    </div>
                                </Marker>
                            ))}
                        </MapLibreMap>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Helper: extract locations from related objects ─────────────────────

function extractLocationsFromRelated(
    relatedObjects: { object: StixObject | null }[],
): LocationItem[] {
    const seen = new Set<string>();
    return relatedObjects
        .filter(
            (r) =>
                r.object &&
                getStixType(r.object.id) === 'location' &&
                !seen.has(r.object.id) &&
                (() => {
                    seen.add(r.object!.id);
                    return true;
                })(),
        )
        .map((r) => {
            const obj = r.object!;
            return {
                id: obj.id,
                name: (obj.name as string | undefined) ?? obj.id,
                latitude: obj.latitude as number | undefined,
                longitude: obj.longitude as number | undefined,
                country: obj.country as string | undefined,
                city: obj.city as string | undefined,
                region: obj.region as string | undefined,
                tlp: (obj.tlp as string | undefined) ?? 'clear',
                createdAt: (obj.createdAt as string | undefined) ?? '',
                updatedAt: (obj.updatedAt as string | undefined) ?? '',
            };
        });
}

// ── Format helpers ─────────────────────────────────────────────────────

function formatDate(d?: string | null): string | undefined {
    if (!d) return undefined;
    try {
        return formatStixDate(d);
    } catch {
        return d;
    }
}

// ── Threat Domain Tab ──────────────────────────────────────────────────

export function ThreatDomainTab() {
    const ThreatActorIcon = entityConfig['threat-actor'].icon;
    const CampaignIcon = entityConfig.campaign.icon;
    const IncidentIcon = entityConfig.incident.icon;

    const threatActorColor = getStixConfig('threat-actor').color;
    const campaignColor = getStixConfig('campaign').color;
    const incidentColor = getStixConfig('incident').color;

    // Table pagination
    const [taPage, setTaPage] = useState(1);
    const [campaignsPage, setCampaignsPage] = useState(1);
    const [incidentsPage, setIncidentsPage] = useState(1);

    // Selected entity ids for graph / info
    const [selectedTaId, setSelectedTaId] = useState<string | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
        null,
    );
    const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
        null,
    );
    const [threatActorSelectOpen, setThreatActorSelectOpen] = useState(false);
    const [campaignSelectOpen, setCampaignSelectOpen] = useState(false);
    const [incidentSelectOpen, setIncidentSelectOpen] = useState(false);

    // Table data
    const { data: taRes, isLoading: taLoading } =
        useDashboardThreatActors(taPage);
    const { data: camRes, isLoading: camLoading } =
        useDashboardCampaigns(campaignsPage);
    const { data: incRes, isLoading: incLoading } =
        useDashboardIncidents(incidentsPage);

    // Selector options
    const { data: allTaRes } = useAllThreatActorsForSelect();
    const { data: allCamRes } = useAllCampaignsForSelect();
    const { data: allIncRes } = useAllIncidentsForSelect();

    const taSelectOptions = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of allTaRes?.data ?? []) map.set(item.id, item.name);
        for (const item of taRes?.data ?? []) map.set(item.id, item.name);
        return [...map.entries()].map(([id, name]) => ({ id, name }));
    }, [allTaRes, taRes]);

    const campaignSelectOptions = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of allCamRes?.data ?? []) map.set(item.id, item.name);
        for (const item of camRes?.data ?? []) map.set(item.id, item.name);
        return [...map.entries()].map(([id, name]) => ({ id, name }));
    }, [allCamRes, camRes]);

    const incidentSelectOptions = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of allIncRes?.data ?? []) map.set(item.id, item.name);
        for (const item of incRes?.data ?? []) map.set(item.id, item.name);
        return [...map.entries()].map(([id, name]) => ({ id, name }));
    }, [allIncRes, incRes]);

    // Selected entity details
    const { data: taDetail, isLoading: taDetailLoading } =
        useSelectedThreatActorDetail(selectedTaId);
    const { data: camDetail, isLoading: camDetailLoading } =
        useSelectedCampaignDetail(selectedCampaignId);
    const { data: incDetail, isLoading: incDetailLoading } =
        useSelectedIncidentDetail(selectedIncidentId);

    const selectedTaName =
        taSelectOptions.find((item) => item.id === selectedTaId)?.name ??
        taDetail?.entity.name;
    const selectedCampaignName =
        campaignSelectOptions.find((item) => item.id === selectedCampaignId)
            ?.name ?? camDetail?.entity.name;
    const selectedIncidentName =
        incidentSelectOptions.find((item) => item.id === selectedIncidentId)
            ?.name ?? incDetail?.entity.name;

    const threatActorSelectWidth = useMemo(
        () => getSelectWidth(taSelectOptions, 'Select Threat Actor'),
        [taSelectOptions],
    );
    const campaignSelectWidth = useMemo(
        () => getSelectWidth(campaignSelectOptions, 'Select Campaign'),
        [campaignSelectOptions],
    );
    const incidentSelectWidth = useMemo(
        () => getSelectWidth(incidentSelectOptions, 'Select Incident'),
        [incidentSelectOptions],
    );

    // Global locations fallback
    const { data: globalLocations } = useLocations();
    const allLocations = useMemo(
        () => globalLocations?.data ?? [],
        [globalLocations],
    );

    // Derived locations for maps (from selected entities or global fallback)
    const campaignLocations = useMemo(() => {
        if (camDetail)
            return extractLocationsFromRelated(camDetail.relatedObjects);
        if (taDetail)
            return extractLocationsFromRelated(taDetail.relatedObjects);
        return allLocations;
    }, [camDetail, taDetail, allLocations]);

    const incidentLocations = useMemo(() => {
        if (camDetail)
            return extractLocationsFromRelated(camDetail.relatedObjects);
        if (taDetail)
            return extractLocationsFromRelated(taDetail.relatedObjects);
        return allLocations;
    }, [camDetail, taDetail, allLocations]);

    // TA info rows
    const taInfoRows = useMemo(() => {
        const e = taDetail?.entity;
        if (!e) return [];
        return [
            { label: 'Name', value: e.name },
            { label: 'Description', value: e.description ?? undefined },
            {
                label: 'Actor Type',
                value: e.threatActorTypes?.join(', ') ?? undefined,
            },
            { label: 'Aliases', value: e.aliases?.join(', ') ?? undefined },
            { label: 'First Seen', value: formatDate(e.firstSeen) },
            { label: 'Last Seen', value: formatDate(e.lastSeen) },
        ];
    }, [taDetail]);

    // Campaign info rows
    const camInfoRows = useMemo(() => {
        const e = camDetail?.entity;
        if (!e) return [];
        return [
            { label: 'Name', value: e.name },
            { label: 'Description', value: e.description ?? undefined },
            { label: 'Objective', value: e.objective ?? undefined },
            { label: 'Aliases', value: e.aliases?.join(', ') ?? undefined },
            { label: 'First Seen', value: formatDate(e.firstSeen) },
            { label: 'Last Seen', value: formatDate(e.lastSeen) },
        ];
    }, [camDetail]);

    // Incident info rows
    const incInfoRows = useMemo(() => {
        const e = incDetail?.entity;
        if (!e) return [];
        return [
            { label: 'Name', value: e.name },
            { label: 'Description', value: e.description ?? undefined },
            { label: 'Objective', value: e.objective ?? undefined },
            { label: 'First Seen', value: formatDate(e.firstSeen) },
            { label: 'Last Seen', value: formatDate(e.lastSeen) },
        ];
    }, [incDetail]);

    return (
        <div className="space-y-6">
            {/* ── Selectors row ── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Threat actor selector */}
                <div
                    className="flex max-w-full min-w-0 flex-col gap-1"
                    style={{ width: threatActorSelectWidth }}
                >
                    <span className="text-foreground/50 text-[0.7rem] font-medium tracking-wider uppercase">
                        Threat Actor
                    </span>
                    <Select
                        open={threatActorSelectOpen}
                        onOpenChange={setThreatActorSelectOpen}
                        value={selectedTaId ?? ''}
                        onValueChange={(v) => {
                            setSelectedTaId(v || null);
                        }}
                    >
                        <SelectTrigger
                            className={SELECT_TRIGGER_CLASS}
                            style={
                                selectedTaId
                                    ? {
                                          borderColor: `${threatActorColor}80`,
                                          boxShadow: `0 0 0 1px ${threatActorColor}1f inset`,
                                      }
                                    : undefined
                            }
                        >
                            {selectedTaId ? (
                                <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                                    <span style={{ color: threatActorColor }}>
                                        <ThreatActorIcon className="size-3.5 shrink-0" />
                                    </span>
                                    <span className="truncate">
                                        {selectedTaName ??
                                            'Selected threat actor'}
                                    </span>
                                </span>
                            ) : (
                                <SelectValue placeholder="Select Threat Actor" />
                            )}
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                            {taSelectOptions.map((ta) => (
                                <SelectItem
                                    key={ta.id}
                                    value={ta.id}
                                    onMouseDown={(event) => {
                                        if (selectedTaId !== ta.id) return;
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setSelectedTaId(null);
                                        setThreatActorSelectOpen(false);
                                    }}
                                    style={
                                        selectedTaId === ta.id
                                            ? {
                                                  color: threatActorColor,
                                                  backgroundColor: `${threatActorColor}14`,
                                              }
                                            : undefined
                                    }
                                >
                                    {ta.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Campaign selector */}
                <div
                    className="flex max-w-full min-w-0 flex-col gap-1"
                    style={{ width: campaignSelectWidth }}
                >
                    <span className="text-foreground/50 text-[0.7rem] font-medium tracking-wider uppercase">
                        Campaign
                    </span>
                    <Select
                        open={campaignSelectOpen}
                        onOpenChange={setCampaignSelectOpen}
                        value={selectedCampaignId ?? ''}
                        onValueChange={(v) => {
                            setSelectedCampaignId(v || null);
                        }}
                    >
                        <SelectTrigger
                            className={SELECT_TRIGGER_CLASS}
                            style={
                                selectedCampaignId
                                    ? {
                                          borderColor: `${campaignColor}80`,
                                          boxShadow: `0 0 0 1px ${campaignColor}1f inset`,
                                      }
                                    : undefined
                            }
                        >
                            {selectedCampaignId ? (
                                <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                                    <span style={{ color: campaignColor }}>
                                        <CampaignIcon className="size-3.5 shrink-0" />
                                    </span>
                                    <span className="truncate">
                                        {selectedCampaignName ??
                                            'Selected campaign'}
                                    </span>
                                </span>
                            ) : (
                                <SelectValue placeholder="Select Campaign" />
                            )}
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                            {campaignSelectOptions.map((c) => (
                                <SelectItem
                                    key={c.id}
                                    value={c.id}
                                    onMouseDown={(event) => {
                                        if (selectedCampaignId !== c.id) return;
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setSelectedCampaignId(null);
                                        setCampaignSelectOpen(false);
                                    }}
                                    style={
                                        selectedCampaignId === c.id
                                            ? {
                                                  color: campaignColor,
                                                  backgroundColor: `${campaignColor}14`,
                                              }
                                            : undefined
                                    }
                                >
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Incident selector */}
                <div
                    className="flex max-w-full min-w-0 flex-col gap-1"
                    style={{ width: incidentSelectWidth }}
                >
                    <span className="text-foreground/50 text-[0.7rem] font-medium tracking-wider uppercase">
                        Incident
                    </span>
                    <Select
                        open={incidentSelectOpen}
                        onOpenChange={setIncidentSelectOpen}
                        value={selectedIncidentId ?? ''}
                        onValueChange={(v) => {
                            setSelectedIncidentId(v || null);
                        }}
                    >
                        <SelectTrigger
                            className={SELECT_TRIGGER_CLASS}
                            style={
                                selectedIncidentId
                                    ? {
                                          borderColor: `${incidentColor}80`,
                                          boxShadow: `0 0 0 1px ${incidentColor}1f inset`,
                                      }
                                    : undefined
                            }
                        >
                            {selectedIncidentId ? (
                                <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                                    <span style={{ color: incidentColor }}>
                                        <IncidentIcon className="size-3.5 shrink-0" />
                                    </span>
                                    <span className="truncate">
                                        {selectedIncidentName ??
                                            'Selected incident'}
                                    </span>
                                </span>
                            ) : (
                                <SelectValue placeholder="Select Incident" />
                            )}
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                            {incidentSelectOptions.map((i) => (
                                <SelectItem
                                    key={i.id}
                                    value={i.id}
                                    onMouseDown={(event) => {
                                        if (selectedIncidentId !== i.id) return;
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setSelectedIncidentId(null);
                                        setIncidentSelectOpen(false);
                                    }}
                                    style={
                                        selectedIncidentId === i.id
                                            ? {
                                                  color: incidentColor,
                                                  backgroundColor: `${incidentColor}14`,
                                              }
                                            : undefined
                                    }
                                >
                                    {i.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Quick tables ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <QuickTable
                    title="Threat Actors"
                    icon={ThreatActorIcon}
                    entities={taRes?.data ?? []}
                    total={taRes?.meta.total ?? 0}
                    page={taPage}
                    onPageChange={setTaPage}
                    loading={taLoading}
                    selectedId={selectedTaId}
                    onSelect={(id) => {
                        setSelectedTaId(id === selectedTaId ? null : id);
                    }}
                />
                <QuickTable
                    title="Campaigns"
                    icon={CampaignIcon}
                    entities={camRes?.data ?? []}
                    total={camRes?.meta.total ?? 0}
                    page={campaignsPage}
                    onPageChange={setCampaignsPage}
                    loading={camLoading}
                    selectedId={selectedCampaignId}
                    onSelect={(id) => {
                        setSelectedCampaignId(
                            id === selectedCampaignId ? null : id,
                        );
                    }}
                />
                <QuickTable
                    title="Incidents"
                    icon={IncidentIcon}
                    entities={incRes?.data ?? []}
                    total={incRes?.meta.total ?? 0}
                    page={incidentsPage}
                    onPageChange={setIncidentsPage}
                    loading={incLoading}
                    selectedId={selectedIncidentId}
                    onSelect={(id) => {
                        setSelectedIncidentId(
                            id === selectedIncidentId ? null : id,
                        );
                    }}
                />
            </div>

            {/* ── Relationship graph ── */}
            <div className="bg-card ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Activity className="text-foreground/50 size-4" />
                        <span className="text-sm font-semibold">
                            Threat Actor Relationship Graph
                        </span>
                        {selectedTaId && (
                            <span className="text-foreground/50 ml-1 text-xs">
                                — {selectedTaName ?? 'Selected threat actor'}
                            </span>
                        )}
                    </div>
                </div>

                {!selectedTaId ? (
                    <div className="text-foreground/40 flex h-72 flex-col items-center justify-center gap-2 text-sm">
                        <Users className="size-8 opacity-30" />
                        <span>
                            Select a threat actor to view its relationship graph
                        </span>
                    </div>
                ) : taDetailLoading ? (
                    <div className="flex h-72 items-center justify-center">
                        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
                    </div>
                ) : taDetail ? (
                    <NetworkGraphTab
                        detail={taDetail}
                        className="h-125 rounded-none shadow-none ring-0"
                    />
                ) : (
                    <div className="text-foreground/40 flex h-72 items-center justify-center text-sm italic">
                        Failed to load graph data
                    </div>
                )}
            </div>

            {/* ── Maps row ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FilteredMap
                    title="Campaigns"
                    subtitle={
                        selectedCampaignId
                            ? `Showing locations linked to campaign: ${selectedCampaignName ?? '…'}`
                            : selectedTaId
                              ? `Showing locations linked to threat actor: ${selectedTaName ?? '…'}`
                              : 'Select a Threat Actor or Campaign to filter'
                    }
                    locations={campaignLocations}
                    loading={camDetailLoading || taDetailLoading}
                />
                <FilteredMap
                    title="Incidents"
                    subtitle={
                        selectedCampaignId
                            ? `Showing incident-related locations for campaign: ${selectedCampaignName ?? '…'}`
                            : selectedTaId
                              ? `Showing incident-related locations for threat actor: ${selectedTaName ?? '…'}`
                              : 'Select a Threat Actor or Campaign to filter incidents'
                    }
                    locations={incidentLocations}
                    loading={camDetailLoading || taDetailLoading}
                />
            </div>

            {/* ── Entity info cards ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <EntityInfoCard
                    title="Threat Actor Information"
                    icon={ThreatActorIcon}
                    rows={taInfoRows}
                    loading={taDetailLoading}
                    empty={!selectedTaId}
                />
                <EntityInfoCard
                    title="Campaign Information"
                    icon={CampaignIcon}
                    rows={camInfoRows}
                    loading={camDetailLoading}
                    empty={!selectedCampaignId}
                />
                <EntityInfoCard
                    title="Incident Information"
                    icon={IncidentIcon}
                    rows={incInfoRows}
                    loading={incDetailLoading}
                    empty={!selectedIncidentId}
                />
            </div>
        </div>
    );
}
