'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getStixType } from '@/shared/lib/stix';
import type {
    EntityBase,
    EntityDetail,
    StixObject,
} from '@/shared/types/entity';
import { Building2, Globe, MapPin, Target, Users } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';

const CARTO_LIGHT =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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

interface MapTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

function getRelatedByTypes<TEntity extends EntityBase>(
    detail: EntityDetail<TEntity>,
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
        <div className="hover:bg-muted/40 flex items-center gap-3 px-6 py-3 transition-colors">
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
        <div className="hover:bg-muted/40 flex items-center gap-3 px-6 py-3 transition-colors">
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

export function MapTab<TEntity extends EntityBase = EntityBase>({
    detail,
}: MapTabProps<TEntity>) {
    const locations = getRelatedByTypes(detail, ['location']);
    const targets = getRelatedByTypes(detail, ['identity']);

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
            <div className="border-border/50 isolate h-72 overflow-hidden rounded-2xl border shadow-sm">
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
                        <h3 className="text-primary text-base font-bold">
                            Localización de campaña
                        </h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        {locations.length === 0 ? (
                            <p className="text-foreground/40 py-6 text-center text-sm">
                                No locations linked.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {locations.map((obj) => (
                                    <LocationRow key={obj.id} obj={obj} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Targeting */}
                <Card className="gap-0 rounded-2xl py-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3 border-b px-6 py-5">
                        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                            <Target className="text-primary size-4" />
                        </div>
                        <h3 className="text-primary text-base font-bold">
                            Targeting
                        </h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        {targets.length === 0 ? (
                            <p className="text-foreground/40 py-6 text-center text-sm">
                                No targets linked.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {targets.map((obj) => (
                                    <TargetRow key={obj.id} obj={obj} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
