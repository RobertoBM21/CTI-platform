'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, Globe, MapPin, Target, Users } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import type { IncidentDetail, StixObject } from '../../types';
import { getStixType } from '../../utils';

const CARTO_LIGHT =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// ── Demo fallback data ────────────────────────────────────────────────

const DEMO_LOCATIONS: StixObject[] = [
    {
        id: 'location--demo-1',
        name: '[DEMO] Ukraine',
        country: 'UA',
        region: 'Eastern Europe',
        latitude: 48.3794,
        longitude: 31.1656,
    } as unknown as StixObject,
    {
        id: 'location--demo-2',
        name: '[DEMO] Russia',
        country: 'RU',
        region: 'Eastern Europe',
        latitude: 61.524,
        longitude: 105.3188,
    } as unknown as StixObject,
];

const DEMO_TARGETS: StixObject[] = [
    {
        id: 'identity--demo-1',
        name: '[DEMO] Ukrainian Government',
        identityClass: 'organization',
        sectors: ['government-regional'],
    } as unknown as StixObject,
    {
        id: 'identity--demo-2',
        name: '[DEMO] European Media Outlets',
        identityClass: 'organization',
        sectors: ['media'],
    } as unknown as StixObject,
];

interface LocationMarkerProps {
    obj: StixObject;
}

function LocationMarkerPin({ obj }: LocationMarkerProps) {
    const label =
        (obj.name as string | undefined) ??
        (obj.country as string | undefined) ??
        'Location';
    return (
        <div className="flex cursor-default flex-col items-center gap-0.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#CF4931] shadow-lg">
                <MapPin className="size-4 text-white" />
            </div>
            <div className="max-w-20 truncate rounded bg-white px-1 py-0.5 text-center text-[0.55rem] font-bold text-gray-700 shadow">
                {label}
            </div>
        </div>
    );
}

interface MapTabProps {
    detail: IncidentDetail;
}

function getRelatedByTypes(
    detail: IncidentDetail,
    types: string[],
): StixObject[] {
    return detail.relatedObjects
        .filter(
            ({ object }) => object && types.includes(getStixType(object.id)),
        )
        .map(({ object }) => object!);
}

function LocationRow({ obj }: { obj: StixObject }) {
    const region = obj.region as string | undefined;
    const country = obj.country as string | undefined;
    const name = obj.name as string | undefined;
    const label = name ?? region ?? country ?? getStixType(obj.id);

    return (
        <div className="flex items-center gap-3 py-3">
            <div className="bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-xl">
                <Globe className="text-foreground/50 size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{label}</p>
                {(region ?? country) && name && (
                    <p className="text-foreground/50 mt-0.5 text-xs">
                        {[region, country].filter(Boolean).join(' · ')}
                    </p>
                )}
            </div>
        </div>
    );
}

function TargetRow({ obj }: { obj: StixObject }) {
    const identityClass = obj.identityClass as string | undefined;
    const name = obj.name as string | undefined;
    const sectors = obj.sectors as string[] | undefined;
    const label = name ?? getStixType(obj.id);

    const Icon = identityClass === 'organization' ? Building2 : Users;

    return (
        <div className="flex items-center gap-3 py-3">
            <div className="bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-xl">
                <Icon className="text-foreground/50 size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{label}</p>
                {(identityClass ?? sectors?.length) && (
                    <p className="text-foreground/50 mt-0.5 text-xs">
                        {[identityClass, sectors?.slice(0, 2).join(', ')]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                )}
            </div>
        </div>
    );
}

export function MapTab({ detail }: MapTabProps) {
    const realLocations = getRelatedByTypes(detail, ['location']);
    const realTargets = getRelatedByTypes(detail, ['identity']);
    const isDemoLocations = realLocations.length === 0;
    const isDemoTargets = realTargets.length === 0;
    const locations = isDemoLocations ? DEMO_LOCATIONS : realLocations;
    const targets = isDemoTargets ? DEMO_TARGETS : realTargets;

    const locationsWithCoords = locations.filter(
        (obj) =>
            typeof obj.latitude === 'number' &&
            typeof obj.longitude === 'number',
    );

    const initialViewState =
        locationsWithCoords.length > 0
            ? {
                  longitude:
                      locationsWithCoords.reduce(
                          (s, o) => s + (o.longitude as number),
                          0,
                      ) / locationsWithCoords.length,
                  latitude:
                      locationsWithCoords.reduce(
                          (s, o) => s + (o.latitude as number),
                          0,
                      ) / locationsWithCoords.length,
                  zoom: 3,
              }
            : { longitude: 10, latitude: 45, zoom: 2 };

    return (
        <div className="space-y-6">
            {/* ── MapLibre map ─────────────────────────────── */}
            <div className="border-border/50 h-72 overflow-hidden rounded-2xl border shadow-sm">
                <Map
                    initialViewState={initialViewState}
                    mapStyle={CARTO_LIGHT}
                    style={{ width: '100%', height: '100%' }}
                    attributionControl={false}
                >
                    <NavigationControl position="top-right" />
                    {locationsWithCoords.map((obj) => (
                        <Marker
                            key={obj.id}
                            longitude={obj.longitude as number}
                            latitude={obj.latitude as number}
                            anchor="bottom"
                        >
                            <LocationMarkerPin obj={obj} />
                        </Marker>
                    ))}
                </Map>
            </div>

            {/* ── Data cards ──────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Campaign Location */}
                <Card className="gap-0 rounded-2xl py-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3 border-b px-6 py-5">
                        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                            <MapPin className="text-primary size-4" />
                        </div>
                        <h3 className="text-base font-bold">
                            Localización de campaña
                        </h3>
                    </CardHeader>
                    <CardContent className="p-0 px-6">
                        {isDemoLocations && (
                            <div className="border-b px-0 py-2">
                                <p className="text-[0.6rem] font-bold tracking-widest text-amber-500 uppercase">
                                    Demo data
                                </p>
                            </div>
                        )}
                        <div className="divide-y">
                            {locations.map((obj) => (
                                <LocationRow key={obj.id} obj={obj} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Targeting */}
                <Card className="gap-0 rounded-2xl py-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3 border-b px-6 py-5">
                        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                            <Target className="text-primary size-4" />
                        </div>
                        <h3 className="text-base font-bold">Targeting</h3>
                    </CardHeader>
                    <CardContent className="p-0 px-6">
                        {isDemoTargets && (
                            <div className="border-b px-0 py-2">
                                <p className="text-[0.6rem] font-bold tracking-widest text-amber-500 uppercase">
                                    Demo data
                                </p>
                            </div>
                        )}
                        <div className="divide-y">
                            {targets.map((obj) => (
                                <TargetRow key={obj.id} obj={obj} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
