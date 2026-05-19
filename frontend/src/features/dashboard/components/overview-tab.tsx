'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatsCard } from '@/shared/components/stats-card';
import type { CatalogEntity } from '@/shared/types/entity';
import {
    Activity,
    AlertTriangle,
    BarChart2,
    Crosshair,
    Globe,
    MapPin,
    Shield,
    ShieldAlert,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
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
import type { ChartBarItem, CountryChartItem, LocationItem } from '../types';

// ── Constants ──────────────────────────────────────────────────────────

const CARTO_LIGHT =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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
        shortName: truncate(e.name, 28),
        value: e.confidence ?? 0,
    }));
}

function toCountryItems(locations: LocationItem[]): CountryChartItem[] {
    const counts: Record<string, number> = {};
    for (const loc of locations) {
        const key = loc.country ?? loc.city ?? loc.name;
        if (!key || key.toLowerCase() === 'world') continue;
        counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
        .map(([country, count]) => ({ country: truncate(country, 16), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
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
    return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }));
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
    const chartHeight = Math.max(200, data.length * 36);

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
                ) : data.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
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
                                width={160}
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
                                maxBarSize={20}
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
                ) : data.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No data
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={75}
                                stroke="none"
                                strokeWidth={0}
                                paddingAngle={data.length > 1 ? 2 : 0}
                            >
                                {data.map((entry, idx) => (
                                    <Cell
                                        key={entry.name}
                                        fill={
                                            TLP_COLORS[entry.name] ??
                                            CHART_PALETTE[
                                                idx % CHART_PALETTE.length
                                            ]
                                        }
                                        stroke="none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(val, name) => [
                                    `${val} entities`,
                                    `TLP:${String(name).toUpperCase()}`,
                                ]}
                                contentStyle={{
                                    borderRadius: '8px',
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(val) => (
                                    <span className="text-xs capitalize">
                                        TLP:{String(val).toUpperCase()}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

function CountryBarChart({
    data,
    loading = false,
}: {
    data: CountryChartItem[];
    loading?: boolean;
}) {
    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Target className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">
                        Incidents per Country
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                {loading ? (
                    <Spinner />
                ) : data.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No location data
                    </div>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height={Math.max(160, data.length * 34)}
                    >
                        <BarChart
                            data={data}
                            margin={{ left: 16, right: 16, top: 4, bottom: 32 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                className="stroke-foreground/10"
                            />
                            <XAxis
                                dataKey="country"
                                tick={{ fontSize: 10 }}
                                angle={-35}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                formatter={(val) => [`${val}`, 'Locations']}
                                contentStyle={{
                                    borderRadius: '8px',
                                    fontSize: 12,
                                }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            >
                                {data.map((entry, idx) => (
                                    <Cell
                                        key={entry.country}
                                        fill={
                                            CHART_PALETTE[
                                                idx % CHART_PALETTE.length
                                            ]
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
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
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-foreground/50 size-4" />
                    <span className="text-sm font-semibold">Alert Volume</span>
                </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                {loading ? (
                    <Spinner />
                ) : data.length === 0 ? (
                    <div className="text-foreground/40 flex h-28 items-center justify-center text-sm italic">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart
                            data={data}
                            margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                className="stroke-foreground/10"
                            />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
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
                                maxBarSize={36}
                            />
                        </BarChart>
                    </ResponsiveContainer>
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
    const pins = useMemo(() => {
        const seen = new Set<string>();
        return locations
            .map((l) => ({ loc: l, coords: resolveCoords(l) }))
            .filter(
                (x): x is { loc: LocationItem; coords: [number, number] } => {
                    if (x.coords === null) return false;
                    if (seen.has(x.loc.id)) return false;
                    seen.add(x.loc.id);
                    return true;
                },
            );
    }, [locations]);

    return (
        <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="text-foreground/50 size-4" />
                        <span className="text-sm font-semibold">
                            All Incidents Map
                        </span>
                    </div>
                    <span className="text-foreground/50 text-xs">
                        {pins.length} location{pins.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex h-72 items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <div className="h-72 w-full">
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
                            {pins.map(({ loc, coords }) => (
                                <Marker
                                    key={loc.id}
                                    longitude={coords[1]}
                                    latitude={coords[0]}
                                    anchor="bottom"
                                >
                                    <div className="group relative flex flex-col items-center">
                                        <div className="flex size-7 items-center justify-center rounded-full bg-[#CF4931] shadow-lg transition-transform group-hover:scale-110">
                                            <MapPin className="size-3.5 text-white" />
                                        </div>
                                        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-center text-[0.6rem] whitespace-nowrap text-white shadow group-hover:block">
                                            {loc.name}
                                        </div>
                                    </div>
                                </Marker>
                            ))}
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
                                            {new Date(
                                                e.createdAt,
                                            ).toLocaleDateString()}
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
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
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
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base leading-tight font-semibold">
                                {campaign.name}
                            </h3>
                            <span
                                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${TLP_PILL[tlp] ?? 'bg-gray-100 text-gray-600'}`}
                            >
                                TLP:{tlp.replace('+strict', '').toUpperCase()}
                            </span>
                        </div>
                        {campaign.confidence != null && (
                            <div className="flex items-center gap-2">
                                <span className="text-foreground/50 text-xs">
                                    Confidence
                                </span>
                                <div className="bg-muted h-1.5 flex-1 rounded-full">
                                    <div
                                        className="bg-primary h-full rounded-full"
                                        style={{
                                            width: `${campaign.confidence}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-foreground/70 text-xs tabular-nums">
                                    {campaign.confidence}%
                                </span>
                            </div>
                        )}
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <dt className="text-foreground/50 font-medium">
                                    Created
                                </dt>
                                <dd className="text-foreground/80">
                                    {new Date(
                                        campaign.createdAt,
                                    ).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-foreground/50 font-medium">
                                    Source
                                </dt>
                                <dd className="text-foreground/80">
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
        const combined = [
            ...incidents.map((e) => ({ ...e, category: 'Incident' as const })),
            ...campaigns.map((e) => ({
                ...e,
                category: 'Campaign' as const,
            })),
        ].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );
        return combined;
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
                                                <span className="text-foreground/70 text-xs font-medium">
                                                    {row.category}
                                                </span>
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
                                                {new Date(
                                                    row.createdAt,
                                                ).toLocaleDateString()}
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

    const locations = locationsRes?.data ?? [];
    const campaigns = campaignsRes?.data ?? [];
    const incidents = incidentsRes?.data ?? [];
    const signalFeed = signalRes?.data ?? [];
    const volumeData = useMemo(
        () => groupByMonth(volumeRes?.data ?? []),
        [volumeRes],
    );

    const campaignChartData = useMemo(
        () => toChartItems(campaigns),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [campaignsRes],
    );
    const incidentChartData = useMemo(
        () => toChartItems(incidents),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [incidentsRes],
    );
    const countryData = useMemo(
        () => toCountryItems(locations),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [locationsRes],
    );
    const tlpData = useMemo(
        () => toTlpDistribution(incidents, campaigns),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [incidentsRes, campaignsRes],
    );

    const topCampaign = campaigns[0];

    return (
        <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatsCard
                    label="Total Incidents"
                    value={statsLoading ? '—' : (stats?.totalIncidents ?? 0)}
                    icon={ShieldAlert}
                    iconClassName="bg-red-50 text-red-600"
                    description="Registered cyber/hybrid incidents"
                />
                <StatsCard
                    label="Total Campaigns"
                    value={statsLoading ? '—' : (stats?.totalCampaigns ?? 0)}
                    icon={Crosshair}
                    iconClassName="bg-blue-50 text-blue-600"
                    description="Active threat campaigns"
                />
                <StatsCard
                    label="Total Threat Actors"
                    value={statsLoading ? '—' : (stats?.totalThreatActors ?? 0)}
                    icon={Users}
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
                    icon={Crosshair}
                    data={campaignChartData}
                    color="#3b82f6"
                    loading={campaignsLoading}
                />
                <HorizBarChart
                    title="Top 10 Incidents"
                    icon={ShieldAlert}
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

            {/* TLP distribution + Incidents per country */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TlpPieChart
                    data={tlpData}
                    loading={campaignsLoading || incidentsLoading}
                />
                <CountryBarChart
                    data={countryData}
                    loading={locationsLoading}
                />
            </div>

            {/* Signal feed + Targets info table */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SignalFeed incidents={signalFeed} loading={signalLoading} />
                <RecentEntitiesTable
                    incidents={incidents}
                    campaigns={campaigns}
                    loading={campaignsLoading || incidentsLoading}
                />
            </div>
        </div>
    );
}
