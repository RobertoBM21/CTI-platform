'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, getStixType } from '@/shared/lib/stix';
import type {
    EntityBase,
    EntityDetail,
    StixObject,
} from '@/shared/types/entity';
import { CalendarClock, Download, FileText, Link2, Shield } from 'lucide-react';
import { useState } from 'react';

interface ArtifactsTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

function getIndicators<TEntity extends EntityBase>(
    detail: EntityDetail<TEntity>,
): Array<{ obj: StixObject; relType: string }> {
    const seen = new Set<string>();
    const result: Array<{ obj: StixObject; relType: string }> = [];
    for (const { object, relationship } of detail.relatedObjects) {
        if (!object || getStixType(object.id) !== 'indicator') continue;
        if (seen.has(object.id)) continue;
        seen.add(object.id);
        result.push({ obj: object, relType: relationship.relationshipType });
    }
    return result;
}

const IOC_TYPE_ICONS: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    'domain-name': Link2,
    url: Link2,
    'ipv4-addr': Shield,
    'ipv6-addr': Shield,
    file: FileText,
    domain: Link2,
};

function inferIocType(obj: StixObject): string {
    const pattern = obj.pattern as string | undefined;
    if (!pattern) return 'unknown';
    if (pattern.includes('domain-name')) return 'domain-name';
    if (pattern.includes('url')) return 'url';
    if (pattern.includes('ipv4-addr')) return 'ipv4-addr';
    if (pattern.includes('ipv6-addr')) return 'ipv6-addr';
    if (pattern.includes('file')) return 'file';
    return 'indicator';
}

function getPatternType(obj: StixObject): string {
    const camel = obj.patternType;
    if (typeof camel === 'string' && camel.length > 0) {
        return camel.toUpperCase();
    }

    const snake = obj.pattern_type;
    if (typeof snake === 'string' && snake.length > 0) {
        return snake.toUpperCase();
    }

    return 'STIX';
}

function getIsoDate(obj: StixObject, camelKey: string, snakeKey: string) {
    const camel = obj[camelKey];
    if (typeof camel === 'string' && camel.length > 0) {
        return camel;
    }

    const snake = obj[snakeKey];
    if (typeof snake === 'string' && snake.length > 0) {
        return snake;
    }

    return undefined;
}

function isExpired(validUntil?: string): boolean {
    if (!validUntil) return false;
    const expiresAt = Date.parse(validUntil);
    if (Number.isNaN(expiresAt)) return false;
    return expiresAt < Date.now();
}

function getPatternLines(obj: StixObject): string[] {
    const pattern = obj.pattern;
    if (typeof pattern !== 'string' || pattern.length === 0) {
        return [];
    }

    return pattern.split('\n');
}

function downloadIndicator(obj: StixObject): void {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `${(obj.name ?? obj.id).replace(/[^a-z0-9._-]/gi, '_')}.json`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function ArtifactsTab<TEntity extends EntityBase = EntityBase>({
    detail,
}: ArtifactsTabProps<TEntity>) {
    const [selected, setSelected] = useState<StixObject | null>(null);
    const [expandedPatterns, setExpandedPatterns] = useState<
        Record<string, boolean>
    >({});
    const indicators = getIndicators(detail);

    function togglePattern(indicatorId: string) {
        setExpandedPatterns((prev) => ({
            ...prev,
            [indicatorId]: !prev[indicatorId],
        }));
    }

    return (
        <div className="flex gap-6">
            {/* ── Artifact list ────────────────────────────── */}
            <div className="flex-1">
                <Card className="gap-0 rounded-2xl py-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5">
                        <h3 className="text-base font-bold">
                            Attachments &amp; IoCs
                        </h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        {indicators.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-foreground/40 text-sm">
                                    No indicators linked to this entity.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {indicators.map(({ obj, relType }) => {
                                    const iocType = inferIocType(obj);
                                    const patternType = getPatternType(obj);
                                    const validFrom = getIsoDate(
                                        obj,
                                        'validFrom',
                                        'valid_from',
                                    );
                                    const validUntil = getIsoDate(
                                        obj,
                                        'validUntil',
                                        'valid_until',
                                    );
                                    const patternLines = getPatternLines(obj);
                                    const hasLongPattern =
                                        patternLines.length > 3;
                                    const isPatternExpanded =
                                        expandedPatterns[obj.id] ?? false;
                                    const visiblePattern = hasLongPattern
                                        ? isPatternExpanded
                                            ? patternLines
                                            : patternLines.slice(0, 3)
                                        : patternLines;
                                    const Icon =
                                        IOC_TYPE_ICONS[iocType] ?? FileText;
                                    const isSelected = selected?.id === obj.id;
                                    return (
                                        <li key={obj.id}>
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    setSelected(
                                                        isSelected ? null : obj,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' ||
                                                        e.key === ' '
                                                    )
                                                        setSelected(
                                                            isSelected
                                                                ? null
                                                                : obj,
                                                        );
                                                }}
                                                className={`hover:bg-muted/40 flex w-full cursor-pointer items-center gap-4 px-6 py-4 text-left transition-colors ${
                                                    isSelected
                                                        ? 'bg-muted/50'
                                                        : ''
                                                }`}
                                            >
                                                <div className="bg-muted/50 flex size-11 shrink-0 items-center justify-center rounded-xl">
                                                    <Icon className="text-foreground/50 size-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate font-semibold">
                                                            {obj.name ??
                                                                (obj.pattern as
                                                                    | string
                                                                    | undefined) ??
                                                                obj.id}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[0.62rem]"
                                                        >
                                                            {patternType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-foreground/50 mt-1 text-sm">
                                                        {iocType.toUpperCase()}{' '}
                                                        · {relType}
                                                        {obj.createdAt &&
                                                            ` · ${formatDate(obj.createdAt)}`}
                                                    </p>

                                                    {(validFrom ||
                                                        validUntil) && (
                                                        <div className="text-foreground/55 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                            {validFrom && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <CalendarClock className="size-3.5" />
                                                                    Valid from{' '}
                                                                    {formatDate(
                                                                        validFrom,
                                                                    )}
                                                                </span>
                                                            )}
                                                            {validUntil && (
                                                                <span
                                                                    className={`inline-flex items-center gap-1 ${
                                                                        isExpired(
                                                                            validUntil,
                                                                        )
                                                                            ? 'text-red-600'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <CalendarClock className="size-3.5" />
                                                                    Valid until{' '}
                                                                    {formatDate(
                                                                        validUntil,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {visiblePattern.length >
                                                        0 && (
                                                        <div className="mt-2">
                                                            <pre className="bg-muted/40 overflow-x-auto rounded-lg p-2 text-xs">
                                                                {visiblePattern.join(
                                                                    '\n',
                                                                )}
                                                                {!isPatternExpanded &&
                                                                    hasLongPattern &&
                                                                    '\n…'}
                                                            </pre>
                                                            {hasLongPattern && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="mt-1 h-auto px-1 py-0 text-xs"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        togglePattern(
                                                                            obj.id,
                                                                        );
                                                                    }}
                                                                >
                                                                    {isPatternExpanded
                                                                        ? 'Show less pattern'
                                                                        : 'Show full pattern'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {obj.description && (
                                                        <p className="text-foreground/40 mt-1.5 line-clamp-2 text-xs leading-relaxed">
                                                            {obj.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 items-center gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            downloadIndicator(
                                                                obj,
                                                            );
                                                        }}
                                                        className="text-foreground/30 hover:text-primary transition-colors"
                                                        aria-label="Download"
                                                    >
                                                        <Download className="size-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Artifact viewer ──────────────────────────── */}
            {selected && (
                <div className="w-80 shrink-0">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-1">
                            <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                Artifact Detail
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                        Name / Value
                                    </p>
                                    <p className="mt-1 font-mono font-semibold break-all">
                                        {selected.name ??
                                            (selected.pattern as
                                                | string
                                                | undefined) ??
                                            '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                        Type
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <p className="font-semibold uppercase">
                                            {inferIocType(selected)}
                                        </p>
                                        <Badge variant="outline">
                                            {getPatternType(selected)}
                                        </Badge>
                                    </div>
                                </div>

                                {selected.description && (
                                    <div>
                                        <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                            Description
                                        </p>
                                        <p className="text-foreground/70 mt-1 text-sm leading-relaxed">
                                            {selected.description}
                                        </p>
                                    </div>
                                )}

                                {selected.createdAt && (
                                    <div>
                                        <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                            First Seen
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {formatDate(selected.createdAt)}
                                        </p>
                                    </div>
                                )}

                                {(getIsoDate(
                                    selected,
                                    'validFrom',
                                    'valid_from',
                                ) ||
                                    getIsoDate(
                                        selected,
                                        'validUntil',
                                        'valid_until',
                                    )) && (
                                    <div>
                                        <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                            Validity Window
                                        </p>
                                        <div className="text-foreground/70 mt-1 space-y-1 text-sm">
                                            {getIsoDate(
                                                selected,
                                                'validFrom',
                                                'valid_from',
                                            ) && (
                                                <p>
                                                    Valid from{' '}
                                                    {formatDate(
                                                        getIsoDate(
                                                            selected,
                                                            'validFrom',
                                                            'valid_from',
                                                        ) as string,
                                                    )}
                                                </p>
                                            )}
                                            {getIsoDate(
                                                selected,
                                                'validUntil',
                                                'valid_until',
                                            ) && (
                                                <p
                                                    className={
                                                        isExpired(
                                                            getIsoDate(
                                                                selected,
                                                                'validUntil',
                                                                'valid_until',
                                                            ),
                                                        )
                                                            ? 'text-red-600'
                                                            : ''
                                                    }
                                                >
                                                    Valid until{' '}
                                                    {formatDate(
                                                        getIsoDate(
                                                            selected,
                                                            'validUntil',
                                                            'valid_until',
                                                        ) as string,
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selected.externalReferences?.map(
                                    (ref, idx) => (
                                        <div key={idx}>
                                            <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                                Source
                                            </p>
                                            <p className="mt-1 text-sm">
                                                {ref.url ? (
                                                    <a
                                                        href={ref.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        {ref.sourceName}
                                                    </a>
                                                ) : (
                                                    ref.sourceName
                                                )}
                                            </p>
                                        </div>
                                    ),
                                )}

                                {getPatternLines(selected).length > 0 && (
                                    <div>
                                        <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                            Pattern
                                        </p>
                                        <pre className="bg-muted/40 mt-1 overflow-x-auto rounded-lg p-2 text-xs">
                                            {(expandedPatterns[selected.id]
                                                ? getPatternLines(selected)
                                                : getPatternLines(
                                                      selected,
                                                  ).slice(0, 3)
                                            ).join('\n')}
                                            {!expandedPatterns[selected.id] &&
                                                getPatternLines(selected)
                                                    .length > 3 &&
                                                '\n…'}
                                        </pre>
                                        {getPatternLines(selected).length >
                                            3 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-1 h-auto px-1 py-0 text-xs"
                                                onClick={() =>
                                                    togglePattern(selected.id)
                                                }
                                            >
                                                {expandedPatterns[selected.id]
                                                    ? 'Show less pattern'
                                                    : 'Show full pattern'}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
