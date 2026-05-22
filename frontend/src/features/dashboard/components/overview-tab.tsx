'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    EntityTypeBadge,
    entityConfig,
} from '@/shared/components/entity-type-badge';
import { StatsCard } from '@/shared/components/stats-card';
import { formatDate as formatStixDate } from '@/shared/lib/stix';
import type { CatalogEntity } from '@/shared/types/entity';
import type { PickingInfo } from '@deck.gl/core';
import { GeoJsonLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import {
    Activity,
    AlertTriangle,
    BarChart2,
    Globe,
    MapPin,
    MapPinned,
    Radar,
    Shield,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    useAlertVolume,
    useDashboardStats,
    useLocations,
    useSignalFeed,
    useTopCampaigns,
    useTopIncidents,
} from '../hooks/use-dashboard';
import type { ChartBarItem, LocationItem } from '../types';

type ResolvedPoint = {
    id: string;
    name: string;
    city: string | null;
    country: string | null;
    confidence: number | null;
    createdAt: string;
    latitude: number;
    longitude: number;
};

// ── Constants ──────────────────────────────────────────────────────────

const CARTO_LIGHT =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const COUNTRY_POLYGONS_URL =
    'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const TLP_COLORS: Record<string, string> = {
    clear: '#9ca3af',
    white: '#9ca3af',
    green: '#22c55e',
    amber: '#f59e0b',
    'amber+strict': '#d97706',
    red: '#ef4444',
};

const CHART_PALETTE = [
    '#CF4931',
    '#3b82f6',
    '#f59e0b',
    '#8b5cf6',
    '#22c55e',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
    '#f97316',
    '#6366f1',
];

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
    afghanistan: [33.9391, 67.71],
    albania: [41.1533, 20.1683],
    algeria: [28.0339, 1.6596],
    argentina: [-38.4161, -63.6167],
    australia: [-25.2744, 133.7751],
    austria: [47.5162, 14.5501],
    azerbaijan: [40.1431, 47.5769],
    bahrain: [26.0275, 50.55],
    bangladesh: [23.685, 90.3563],
    belarus: [53.7098, 27.9534],
    belgium: [50.5039, 4.4699],
    bolivia: [-16.2902, -63.5887],
    brazil: [-14.235, -51.9253],
    bulgaria: [42.7339, 25.4858],
    canada: [56.1304, -106.3468],
    chile: [-35.6751, -71.543],
    china: [35.8617, 104.1954],
    colombia: [4.5709, -74.2973],
    croatia: [45.1, 15.2],
    cuba: [21.5218, -77.7812],
    czechia: [49.8175, 15.473],
    'czech republic': [49.8175, 15.473],
    denmark: [56.2639, 9.5018],
    ecuador: [-1.8312, -78.1834],
    egypt: [26.8206, 30.8025],
    estonia: [58.5953, 25.0136],
    ethiopia: [9.145, 40.4897],
    finland: [61.9241, 25.7482],
    france: [46.2276, 2.2137],
    georgia: [42.3154, 43.3569],
    germany: [51.1657, 10.4515],
    ghana: [7.9465, -1.0232],
    greece: [39.0742, 21.8243],
    hungary: [47.1625, 19.5033],
    india: [20.5937, 78.9629],
    indonesia: [-0.7893, 113.9213],
    iran: [32.4279, 53.688],
    iraq: [33.2232, 43.6793],
    ireland: [53.4129, -8.2439],
    israel: [31.0461, 34.8516],
    italy: [41.8719, 12.5674],
    japan: [36.2048, 138.2529],
    jordan: [30.5852, 36.2384],
    kenya: [-0.0236, 37.9062],
    latvia: [56.8796, 24.6032],
    lebanon: [33.8547, 35.8623],
    libya: [26.3351, 17.2283],
    lithuania: [55.1694, 23.8813],
    luxembourg: [49.8153, 6.1296],
    malaysia: [4.2105, 101.9758],
    mexico: [23.6345, -102.5528],
    moldova: [47.4116, 28.3699],
    morocco: [31.7917, -7.0926],
    netherlands: [52.1326, 5.2913],
    'new zealand': [-40.9006, 174.886],
    nigeria: [9.082, 8.6753],
    'north korea': [40.3399, 127.5101],
    norway: [60.472, 8.4689],
    pakistan: [30.3753, 69.3451],
    palestine: [31.9522, 35.2332],
    peru: [-9.19, -75.0152],
    philippines: [12.8797, 121.774],
    poland: [51.9194, 19.1451],
    portugal: [39.3999, -8.2245],
    qatar: [25.3548, 51.1839],
    romania: [45.9432, 24.9668],
    russia: [61.524, 105.3188],
    'russian federation': [61.524, 105.3188],
    'saudi arabia': [23.8859, 45.0792],
    serbia: [44.0165, 21.0059],
    singapore: [1.3521, 103.8198],
    slovakia: [48.669, 19.699],
    slovenia: [46.1512, 14.9955],
    'south africa': [-30.5595, 22.9375],
    'south korea': [35.9078, 127.7669],
    spain: [40.4637, -3.7492],
    sweden: [60.1282, 18.6435],
    switzerland: [46.8182, 8.2275],
    syria: [34.8021, 38.9968],
    taiwan: [23.6978, 120.9605],
    thailand: [15.87, 100.9925],
    turkey: [38.9637, 35.2433],
    ukraine: [48.3794, 31.1656],
    'united arab emirates': [23.4241, 53.8478],
    'united kingdom': [55.3781, -3.436],
    uk: [55.3781, -3.436],
    'united states': [37.0902, -95.7129],
    'united states of america': [37.0902, -95.7129],
    usa: [37.0902, -95.7129],
    us: [37.0902, -95.7129],
    venezuela: [6.4238, -66.5897],
    vietnam: [14.0583, 108.2772],
    europe: [54.526, 15.2551],
    'middle east': [29.2985, 42.551],
    asia: [34.0479, 100.6197],
    africa: [8.7832, 34.5085],
};

function resolveCoords(loc: LocationItem): [number, number] | null {
    if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        return [loc.latitude, loc.longitude];
    }
    const key = (loc.country ?? loc.city ?? loc.name ?? '')
        .toLowerCase()
        .trim();
    if (key === 'world' || key === 'global' || key === '') return null;
    return COUNTRY_CENTROIDS[key] ?? null;
}

// ── Helpers ────────────────────────────────────────────────────────────

function truncate(str: string, max: number): string {
    return str.length <= max ? str : str.slice(0, max - 1) + '…';
}

function toChartItems(entities: CatalogEntity[]): ChartBarItem[] {
    return entities.map((e) => ({
        id: e.id,
        name: e.name,
        shortName: truncate(e.name, 24),
        value: e.confidence ?? 0,
    }));
}

function byConfidenceDesc(a: CatalogEntity, b: CatalogEntity): number {
    return (b.confidence ?? -1) - (a.confidence ?? -1);
}

function toResolvedPoints(locations: LocationItem[]): ResolvedPoint[] {
    const seen = new Set<string>();
    const points: ResolvedPoint[] = [];

    for (const loc of locations) {
        const coords = resolveCoords(loc);
        if (!coords) continue;

        const country = (loc.country ?? loc.name ?? '').trim();
        if (!country || country.toLowerCase() === 'world') continue;
        if (seen.has(loc.id)) continue;
        seen.add(loc.id);

        points.push({
            id: loc.id,
            name: loc.name,
            city: loc.city ?? null,
            country,
            confidence: loc.confidence ?? null,
            createdAt: loc.createdAt,
            latitude: coords[0],
            longitude: coords[1],
        });
    }

    return points;
}

function toCountryCounts(
    points: ResolvedPoint[],
): { country: string; count: number }[] {
    const counts: Record<string, number> = {};

    for (const p of points) {
        counts[p.country ?? p.name] = (counts[p.country ?? p.name] ?? 0) + 1;
    }

    return Object.entries(counts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);
}

function getCountryFillColor(
    count: number,
    maxCount: number,
): [number, number, number, number] {
    if (count <= 0) return [0, 0, 0, 0];

    const t = Math.min(1, count / Math.max(maxCount, 1));
    const red = Math.round(253 + (207 - 253) * t);
    const green = Math.round(230 + (73 - 230) * t);
    const blue = Math.round(138 + (49 - 138) * t);
    const alpha = Math.round(90 + 70 * t);

    return [red, green, blue, alpha];
}

function normalizeCountryKey(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

function toTlpDistribution(
    incidents: CatalogEntity[],
    campaigns: CatalogEntity[],
): { name: string; value: number }[] {
    const counts: Record<string, number> = {};
    for (const e of [...incidents, ...campaigns]) {
        const tlp = ((e.tlp as string) ?? 'clear').toLowerCase();
        counts[tlp] = (counts[tlp] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function groupByMonth(
    entities: CatalogEntity[],
): { month: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const e of entities) {
        const d = new Date(e.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        counts[key] = (counts[key] ?? 0) + 1;
    }

    const sortedMonths = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    if (sortedMonths.length === 0) return [];

    const [startYear, startMonth] = sortedMonths[0].split('-').map(Number);
    const [endYear, endMonth] = sortedMonths[sortedMonths.length - 1]
        .split('-')
        .map(Number);

    const cursor = new Date(Date.UTC(startYear, startMonth - 1, 1));
    const end = new Date(Date.UTC(endYear, endMonth - 1, 1));
    const series: { month: string; count: number }[] = [];

    while (cursor <= end) {
        const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
        series.push({ month: key, count: counts[key] ?? 0 });
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    return series;
}

// ── Spinner ────────────────────────────────────────────────────────────

function Spinner() {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────

function HorizBarChart({
    title,
    icon: Icon,
    data,
    color = '#CF4931',
    loading = false,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    data: ChartBarItem[];
    color?: string;
    loading?: boolean;
}) {
    const normalizedData = useMemo(
        () => [...data].sort((a, b) => b.value - a.value),
        [data],
    );
    const chartHeight = Math.max(220, normalizedData.length * 34);

    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Icon className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">{title}</span>
                </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                {loading ? (
                    <Spinner />
                ) : normalizedData.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart
                            layout="vertical"
                            data={normalizedData}
                            margin={{ left: 0, right: 20, top: 2, bottom: 2 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                className="stroke-foreground/10"
                            />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="shortName"
                                width={126}
                                interval={0}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                formatter={(val) => [`${val}`, 'Confidence']}
                                labelFormatter={(_, payload) =>
                                    payload?.[0]?.payload?.name ?? ''
                                }
                                contentStyle={{
                                    borderRadius: '8px',
                                    fontSize: 12,
                                }}
                            />
                            <Bar
                                dataKey="value"
                                fill={color}
                                radius={[0, 4, 4, 0]}
                                maxBarSize={18}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

function TlpPieChart({
    data,
    loading = false,
}: {
    data: { name: string; value: number }[];
    loading?: boolean;
}) {
    const total = useMemo(
        () => data.reduce((acc, entry) => acc + entry.value, 0),
        [data],
    );
    const sortedData = useMemo(
        () => [...data].sort((a, b) => b.value - a.value),
        [data],
    );

    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Shield className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">
                        TLP Distribution
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                {loading ? (
                    <Spinner />
                ) : sortedData.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No data
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
                        <div className="md:w-[56%]">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={sortedData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={74}
                                        stroke="none"
                                        strokeWidth={0}
                                        paddingAngle={
                                            sortedData.length > 1 ? 2 : 0
                                        }
                                    >
                                        {sortedData.map((entry, idx) => (
                                            <Cell
                                                key={entry.name}
                                                fill={
                                                    TLP_COLORS[entry.name] ??
                                                    CHART_PALETTE[
                                                        idx %
                                                            CHART_PALETTE.length
                                                    ]
                                                }
                                                stroke="none"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val, name) => [
                                            `${val} (${Math.round((Number(val) / Math.max(total, 1)) * 100)}%)`,
                                            `TLP:${String(name).toUpperCase()}`,
                                        ]}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            fontSize: 12,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-1 px-2 pb-2 md:max-h-48 md:w-[44%] md:overflow-y-auto md:pr-3">
                            {sortedData.map((entry, idx) => {
                                const fill =
                                    TLP_COLORS[entry.name] ??
                                    CHART_PALETTE[idx % CHART_PALETTE.length];
                                const percent = Math.round(
                                    (entry.value / Math.max(total, 1)) * 100,
                                );

                                return (
                                    <div
                                        key={`legend-${entry.name}`}
                                        className="border-border/60 flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                                    >
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: fill,
                                                }}
                                            />
                                            <span className="truncate text-xs font-semibold uppercase">
                                                {entry.name.replace(
                                                    '+strict',
                                                    '+',
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-foreground/65 text-xs tabular-nums">
                                            {percent}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CountryHeatMap({
    locations,
    loading = false,
}: {
    locations: LocationItem[];
    loading?: boolean;
}) {
    const points = useMemo(() => toResolvedPoints(locations), [locations]);
    const countryCounts = useMemo(() => toCountryCounts(points), [points]);
    const maxCount = useMemo(
        () => Math.max(1, ...countryCounts.map((item) => item.count)),
        [countryCounts],
    );

    const countByCode = useMemo(() => {
        const map = new globalThis.Map<string, number>();
        for (const { country, count } of countryCounts) {
            const key = country.trim().toUpperCase();
            if (key.length === 2) map.set(key, count);
        }
        return map;
    }, [countryCounts]);

    const countByName = useMemo(() => {
        const map = new globalThis.Map<string, number>();
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

        for (const { country, count } of countryCounts) {
            const trimmedCountry = country.trim();
            map.set(normalizeCountryKey(trimmedCountry), count);

            const upperCountry = trimmedCountry.toUpperCase();
            if (upperCountry.length === 2) {
                const canonicalCode =
                    upperCountry === 'UK' ? 'GB' : upperCountry;
                const displayName = regionNames.of(canonicalCode);

                if (displayName) {
                    map.set(normalizeCountryKey(displayName), count);
                }
            }
        }

        return map;
    }, [countryCounts]);

    const getCountryCount = useCallback(
        (feature: { properties?: Record<string, unknown> } | undefined) => {
            if (!feature?.properties) return 0;

            const codeRaw = String(
                feature.properties.ISO_A2 ?? feature.properties.ISO2 ?? '',
            ).toUpperCase();
            const codeCandidates = [
                codeRaw,
                String(feature.properties.iso_a2 ?? '').toUpperCase(),
                String(
                    feature.properties['ISO3166-1-Alpha-2'] ?? '',
                ).toUpperCase(),
            ].filter(Boolean);

            for (const code of codeCandidates) {
                if (countByCode.has(code)) return countByCode.get(code) ?? 0;
            }

            const nameRaw = String(
                feature.properties.ADMIN ??
                    feature.properties.NAME ??
                    feature.properties.name_en ??
                    feature.properties.name ??
                    feature.properties.sovereignt ??
                    '',
            );
            const nameKey = normalizeCountryKey(nameRaw);
            return countByName.get(nameKey) ?? 0;
        },
        [countByCode, countByName],
    );

    const countryLayer = useMemo(
        () =>
            new GeoJsonLayer({
                id: 'incidents-country-fill-layer',
                data: COUNTRY_POLYGONS_URL,
                filled: true,
                stroked: true,
                pickable: true,
                lineWidthMinPixels: 0.7,
                getLineColor: [216, 211, 204, 120],
                getFillColor: (feature) =>
                    getCountryFillColor(
                        getCountryCount(
                            feature as {
                                properties?: Record<string, unknown>;
                            },
                        ),
                        maxCount,
                    ),
            }),
        [getCountryCount, maxCount],
    );

    const [hoverCard, setHoverCard] = useState<{
        label: string;
        count: number;
    } | null>(null);

    const handleCountryHover = useCallback(
        (info: PickingInfo<{ properties?: Record<string, unknown> }>) => {
            if (!info.object) {
                setHoverCard(null);
                return;
            }

            const label = String(
                info.object.properties?.ADMIN ??
                    info.object.properties?.NAME ??
                    info.object.properties?.name ??
                    'Unknown',
            );
            const count = getCountryCount(info.object);
            setHoverCard({ label, count });
        },
        [getCountryCount],
    );

    return (
        <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Radar className="text-foreground/50 size-4" />
                        <span className="text-sm font-semibold">
                            Incidents per Country
                        </span>
                    </div>
                    <span className="text-foreground/50 text-xs">
                        Heat by location count
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 p-0 pb-2">
                {loading ? (
                    <Spinner />
                ) : points.length === 0 ? (
                    <div className="text-foreground/40 flex h-44 items-center justify-center text-sm italic">
                        No location data
                    </div>
                ) : (
                    <>
                        <div className="relative h-72 w-full overflow-hidden">
                            <DeckGL
                                initialViewState={{
                                    longitude: 10,
                                    latitude: 25,
                                    zoom: 1.2,
                                }}
                                controller={true}
                                layers={[countryLayer]}
                                onHover={handleCountryHover}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <Map
                                    style={{ width: '100%', height: '100%' }}
                                    mapStyle={CARTO_LIGHT}
                                    attributionControl={false}
                                >
                                    <NavigationControl position="top-right" />
                                </Map>
                            </DeckGL>

                            {hoverCard ? (
                                <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-slate-800/92 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
                                    <div className="font-semibold">
                                        {hoverCard.label}
                                    </div>
                                    <div className="text-white/85 tabular-nums">
                                        Incidents: {hoverCard.count}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-end gap-2 px-4 pb-2 text-[0.7rem]">
                            <span className="text-foreground/55">
                                Low activity
                            </span>
                            <div className="h-2 w-28 rounded-full bg-linear-to-r from-[#fde68a] via-[#f59e0b] to-[#cf4931]" />
                            <span className="text-foreground/55">
                                High activity
                            </span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function AlertVolumeChart({
    data,
    loading = false,
}: {
    data: { month: string; count: number }[];
    loading?: boolean;
}) {
    return (
        <Card className="h-full gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">Alert Volume</span>
                </div>
            </CardHeader>
            <CardContent className="flex min-h-55 flex-1 px-3 pt-1 pb-2">
                {loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <Spinner />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-foreground/40 flex h-full w-full items-center justify-center text-sm italic">
                        No data available
                    </div>
                ) : (
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{
                                    left: 10,
                                    right: 10,
                                    top: 8,
                                    bottom: 2,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    className="stroke-foreground/10"
                                />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11 }}
                                    tickMargin={8}
                                    minTickGap={12}
                                    padding={{ left: 28, right: 28 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    allowDecimals={false}
                                    width={22}
                                />
                                <Tooltip
                                    formatter={(val) => [`${val}`, 'Incidents']}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        fontSize: 12,
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#CF4931"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={34}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function IncidentsMap({
    locations,
    loading = false,
}: {
    locations: LocationItem[];
    loading?: boolean;
}) {
    const points = useMemo(() => toResolvedPoints(locations), [locations]);
    const [hoveredPoint, setHoveredPoint] = useState<ResolvedPoint | null>(
        null,
    );

    return (
        <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="text-foreground/50 size-4" />
                        <span className="text-sm font-semibold">
                            All Incidents
                        </span>
                    </div>
                    <span className="text-foreground/50 text-xs">
                        {points.length} location{points.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex h-72 items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <div className="h-80 w-full">
                        <Map
                            initialViewState={{
                                longitude: 10,
                                latitude: 25,
                                zoom: 1.4,
                            }}
                            style={{ width: '100%', height: '100%' }}
                            mapStyle={CARTO_LIGHT}
                            attributionControl={false}
                        >
                            <NavigationControl position="top-right" />
                            {points.map((point) => (
                                <Marker
                                    key={point.id}
                                    longitude={point.longitude}
                                    latitude={point.latitude}
                                    anchor="bottom"
                                >
                                    <button
                                        type="button"
                                        onMouseEnter={() =>
                                            setHoveredPoint(point)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredPoint((current) =>
                                                current?.id === point.id
                                                    ? null
                                                    : current,
                                            )
                                        }
                                        onClick={() => setHoveredPoint(point)}
                                        className="group relative flex flex-col items-center"
                                        aria-label={`Inspect location ${point.name}`}
                                    >
                                        <div className="flex size-7 items-center justify-center rounded-full bg-[#CF4931] shadow-lg transition-transform group-hover:scale-110">
                                            <MapPin className="size-3.5 text-white" />
                                        </div>
                                    </button>
                                </Marker>
                            ))}

                            {hoveredPoint ? (
                                <Popup
                                    longitude={hoveredPoint.longitude}
                                    latitude={hoveredPoint.latitude}
                                    anchor="top"
                                    closeButton={false}
                                    closeOnClick={false}
                                    offset={20}
                                    className="cti-map-popup"
                                >
                                    <div className="cti-map-popup-card border-border/70 bg-card/95 min-w-52 rounded-xl border p-3 text-xs shadow-xl backdrop-blur-sm">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <div className="text-base leading-tight font-semibold">
                                                {hoveredPoint.name}
                                            </div>
                                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[0.65rem] font-semibold">
                                                Location
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground mb-1.5 flex items-center gap-1">
                                            <MapPinned className="size-3" />
                                            <span>
                                                {hoveredPoint.city
                                                    ? `${hoveredPoint.city}, ${hoveredPoint.country ?? ''}`
                                                    : hoveredPoint.country}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground">
                                            Coordinates:{' '}
                                            {hoveredPoint.latitude.toFixed(2)},{' '}
                                            {hoveredPoint.longitude.toFixed(2)}
                                        </div>
                                        <div className="text-muted-foreground">
                                            Confidence:{' '}
                                            {hoveredPoint.confidence != null
                                                ? `${hoveredPoint.confidence}%`
                                                : '—'}
                                        </div>
                                        <div className="text-muted-foreground">
                                            Created:{' '}
                                            {formatStixDate(
                                                hoveredPoint.createdAt,
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            ) : null}
                        </Map>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const TLP_PILL: Record<string, string> = {
    clear: 'bg-gray-100 text-gray-600',
    white: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    'amber+strict': 'bg-amber-200 text-amber-800',
    red: 'bg-red-100 text-red-700',
};

function SignalFeed({
    incidents: entities,
    loading = false,
}: {
    incidents: CatalogEntity[];
    loading?: boolean;
}) {
    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Zap className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">Signal Feed</span>
                    <span className="text-foreground/40 ml-auto text-xs">
                        Recent incidents
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <Spinner />
                ) : entities.length === 0 ? (
                    <div className="text-foreground/40 flex h-20 items-center justify-center text-sm italic">
                        No signals
                    </div>
                ) : (
                    <ul className="divide-y">
                        {entities.map((e) => {
                            const tlp = (
                                (e.tlp as string) ?? 'clear'
                            ).toLowerCase();
                            return (
                                <li
                                    key={e.id}
                                    className="hover:bg-muted/30 flex items-center gap-3 px-5 py-3 transition-colors"
                                >
                                    <AlertTriangle className="text-primary size-4 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {e.name}
                                        </p>
                                        <p className="text-foreground/50 text-xs">
                                            {formatStixDate(e.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${TLP_PILL[tlp] ?? 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {tlp
                                            .replace('+strict', '')
                                            .toUpperCase()}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

function ActiveCampaignCard({
    campaign,
    loading = false,
}: {
    campaign: CatalogEntity | undefined;
    loading?: boolean;
}) {
    if (!loading && !campaign) return null;

    const tlp = ((campaign?.tlp as string) ?? 'clear').toLowerCase();

    return (
        <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <BarChart2 className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">
                        Top Active Campaign
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {loading ? (
                    <Spinner />
                ) : campaign ? (
                    <div className="from-primary/5 to-primary/15 border-border/70 space-y-4 rounded-xl border bg-linear-to-br p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-foreground/50 text-[0.65rem] font-semibold tracking-wider uppercase">
                                    Highest confidence campaign
                                </p>
                                <h3 className="text-base leading-tight font-semibold">
                                    {campaign.name}
                                </h3>
                            </div>
                            <span
                                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${TLP_PILL[tlp] ?? 'bg-gray-100 text-gray-600'}`}
                            >
                                TLP:{tlp.replace('+strict', '').toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-foreground/55 text-xs font-medium">
                                    Confidence
                                </span>
                                <span className="text-primary text-sm font-semibold tabular-nums">
                                    {campaign.confidence != null
                                        ? `${campaign.confidence}%`
                                        : '—'}
                                </span>
                            </div>
                            <div className="bg-muted h-2 rounded-full">
                                <div
                                    className="from-primary to-primary/70 h-full rounded-full bg-linear-to-r"
                                    style={{
                                        width: `${campaign.confidence ?? 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <dl className="grid grid-cols-2 gap-2 text-xs">
                            <div className="border-border/50 bg-background/70 rounded-lg border p-2">
                                <dt className="text-foreground/55 font-medium">
                                    Created
                                </dt>
                                <dd className="text-foreground/85 mt-0.5">
                                    {formatStixDate(campaign.createdAt)}
                                </dd>
                            </div>
                            <div className="border-border/50 bg-background/70 rounded-lg border p-2">
                                <dt className="text-foreground/55 font-medium">
                                    Source
                                </dt>
                                <dd className="text-foreground/85 mt-0.5 truncate">
                                    {(campaign.createdBy as string | null) ??
                                        '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

function RecentEntitiesTable({
    incidents,
    campaigns,
    loading = false,
}: {
    incidents: CatalogEntity[];
    campaigns: CatalogEntity[];
    loading?: boolean;
}) {
    const rows = useMemo(() => {
        return [...incidents, ...campaigns]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
            .slice(0, 10);
    }, [incidents, campaigns]);

    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Activity className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">
                        Targets Information
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <Spinner />
                ) : rows.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No data available
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 border-b text-left">
                                    <th className="text-foreground/60 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase">
                                        Type
                                    </th>
                                    <th className="text-foreground/60 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                                        Name
                                    </th>
                                    <th className="text-foreground/60 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                                        TLP
                                    </th>
                                    <th className="text-foreground/60 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                                        Confidence
                                    </th>
                                    <th className="text-foreground/60 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rows.map((row) => {
                                    const tlp = (
                                        (row.tlp as string) ?? 'clear'
                                    ).toLowerCase();
                                    return (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-5 py-3">
                                                <EntityTypeBadge
                                                    entityType={row.entityType}
                                                />
                                            </td>
                                            <td className="max-w-xs truncate px-4 py-3 font-medium">
                                                {row.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${TLP_PILL[tlp] ?? 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {tlp
                                                        .replace('+strict', '')
                                                        .toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                <span className="text-foreground/70 text-xs">
                                                    {row.confidence != null
                                                        ? `${row.confidence}%`
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="text-foreground/50 px-5 py-3 text-xs tabular-nums">
                                                {formatStixDate(row.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Overview Tab ───────────────────────────────────────────────────────

export function OverviewTab() {
    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: locationsRes, isLoading: locationsLoading } = useLocations();
    const { data: campaignsRes, isLoading: campaignsLoading } =
        useTopCampaigns();
    const { data: incidentsRes, isLoading: incidentsLoading } =
        useTopIncidents();
    const { data: signalRes, isLoading: signalLoading } = useSignalFeed();
    const { data: volumeRes, isLoading: volumeLoading } = useAlertVolume();

    const locations = useMemo(() => locationsRes?.data ?? [], [locationsRes]);
    const campaigns = useMemo(() => campaignsRes?.data ?? [], [campaignsRes]);
    const incidents = useMemo(() => incidentsRes?.data ?? [], [incidentsRes]);
    const signalFeed = useMemo(() => signalRes?.data ?? [], [signalRes]);
    const IncidentIcon = entityConfig.incident.icon;
    const CampaignIcon = entityConfig.campaign.icon;
    const ThreatActorIcon = entityConfig['threat-actor'].icon;
    const volumeData = useMemo(
        () => groupByMonth(volumeRes?.data ?? []),
        [volumeRes],
    );

    const campaignChartData = useMemo(
        () => toChartItems([...campaigns].sort(byConfidenceDesc).slice(0, 10)),
        [campaigns],
    );
    const incidentChartData = useMemo(
        () => toChartItems([...incidents].sort(byConfidenceDesc).slice(0, 10)),
        [incidents],
    );
    const tlpData = useMemo(
        () => toTlpDistribution(incidents, campaigns),
        [incidents, campaigns],
    );

    const topCampaign = campaigns[0];

    return (
        <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatsCard
                    label="Total Incidents"
                    value={statsLoading ? '—' : (stats?.totalIncidents ?? 0)}
                    icon={IncidentIcon}
                    iconClassName="bg-red-50 text-red-600"
                    description="Registered cyber/hybrid incidents"
                />
                <StatsCard
                    label="Total Campaigns"
                    value={statsLoading ? '—' : (stats?.totalCampaigns ?? 0)}
                    icon={CampaignIcon}
                    iconClassName="bg-blue-50 text-blue-600"
                    description="Active threat campaigns"
                />
                <StatsCard
                    label="Total Threat Actors"
                    value={statsLoading ? '—' : (stats?.totalThreatActors ?? 0)}
                    icon={ThreatActorIcon}
                    iconClassName="bg-purple-50 text-purple-600"
                    description="Identified threat actor groups"
                />
            </div>

            {/* World map */}
            <IncidentsMap locations={locations} loading={locationsLoading} />

            {/* Top 10 charts row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <HorizBarChart
                    title="Top 10 Campaigns"
                    icon={CampaignIcon}
                    data={campaignChartData}
                    color="#3b82f6"
                    loading={campaignsLoading}
                />
                <HorizBarChart
                    title="Top 10 Incidents"
                    icon={IncidentIcon}
                    data={incidentChartData}
                    color="#CF4931"
                    loading={incidentsLoading}
                />
            </div>

            {/* Alert volume + Active campaign */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AlertVolumeChart data={volumeData} loading={volumeLoading} />
                <ActiveCampaignCard
                    campaign={topCampaign}
                    loading={campaignsLoading}
                />
            </div>

            {/* Incidents per country */}
            <CountryHeatMap locations={locations} loading={locationsLoading} />

            {/* TLP distribution + Signal feed */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TlpPieChart
                    data={tlpData}
                    loading={campaignsLoading || incidentsLoading}
                />
                <SignalFeed incidents={signalFeed} loading={signalLoading} />
            </div>

            {/* Targets info table */}
            <RecentEntitiesTable
                incidents={incidents}
                campaigns={campaigns}
                loading={campaignsLoading || incidentsLoading}
            />
        </div>
    );
}
