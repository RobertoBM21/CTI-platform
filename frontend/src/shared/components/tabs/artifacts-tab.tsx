'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, getStixType } from '@/shared/lib/stix';
import type {
    EntityBase,
    EntityDetail,
    StixObject,
} from '@/shared/types/entity';
import { Download, FileText, Link2, Shield } from 'lucide-react';
import { useState } from 'react';

interface ArtifactsTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

/** Demo indicators shown when no real IoCs are linked */
const DEMO_INDICATORS: Array<{ obj: StixObject; relType: string }> = [
    {
        obj: {
            id: 'indicator--demo-1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
            name: '[DEMO] Suspicious IP — 185.220.101.47',
            pattern: "[ipv4-addr:value = '185.220.101.47']",
            description:
                'C2 server used by Cobalt Strike beacon. Observed active on port 443.',
            confidence: 82,
        } as unknown as StixObject,
        relType: 'indicates',
    },
    {
        obj: {
            id: 'indicator--demo-2',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
            name: '[DEMO] Phishing domain — secure-login-verify.net',
            pattern: "[domain-name:value = 'secure-login-verify.net']",
            description:
                'Domain registered 48h before incident. Associated with credential harvesting campaign.',
            confidence: 71,
        } as unknown as StixObject,
        relType: 'indicates',
    },
    {
        obj: {
            id: 'indicator--demo-3',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
            name: '[DEMO] Malware hash — SHA256:3d9e…a4c1',
            pattern:
                "[file:hashes.SHA-256 = '3d9e3d4b2f9a1c8e7d6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5a4c1']",
            description:
                'Cobalt Strike stager DLL dropped in %TEMP%. Persistence via scheduled task.',
            confidence: 90,
        } as unknown as StixObject,
        relType: 'indicates',
    },
];

function getIndicators<TEntity extends EntityBase>(
    detail: EntityDetail<TEntity>,
): Array<{ obj: StixObject; relType: string }> {
    return detail.relatedObjects
        .filter(
            ({ object }) => object && getStixType(object.id) === 'indicator',
        )
        .map(({ object, relationship }) => ({
            obj: object!,
            relType: relationship.relationshipType,
        }));
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
    const realIndicators = getIndicators(detail);
    const isDemo = realIndicators.length === 0;
    const indicators = isDemo ? DEMO_INDICATORS : realIndicators;

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
                        {isDemo && (
                            <div className="border-b px-6 py-3">
                                <p className="text-[0.6rem] font-bold tracking-widest text-amber-500 uppercase">
                                    Demo data — no real IoCs linked to this
                                    entity
                                </p>
                            </div>
                        )}
                        <ul className="divide-y">
                            {indicators.map(({ obj, relType }) => {
                                const iocType = inferIocType(obj);
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
                                                        isSelected ? null : obj,
                                                    );
                                            }}
                                            className={`hover:bg-muted/40 flex w-full cursor-pointer items-center gap-4 px-6 py-4 text-left transition-colors ${
                                                isSelected ? 'bg-muted/50' : ''
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
                                                    {isDemo && (
                                                        <span className="shrink-0 rounded border border-dashed border-amber-400/50 bg-amber-50 px-1.5 py-0.5 text-[0.5rem] font-bold tracking-widest text-amber-600 uppercase dark:bg-amber-950/30 dark:text-amber-400">
                                                            demo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-foreground/50 mt-1 text-sm">
                                                    {iocType.toUpperCase()} ·{' '}
                                                    {relType}
                                                    {obj.createdAt &&
                                                        ` · ${formatDate(obj.createdAt)}`}
                                                </p>
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
                                                        downloadIndicator(obj);
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
                                    <p className="mt-1 font-semibold uppercase">
                                        {inferIocType(selected)}
                                    </p>
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

                                {(selected.pattern as string | undefined) && (
                                    <div>
                                        <p className="text-foreground/50 text-[0.65rem] font-bold tracking-widest uppercase">
                                            Pattern
                                        </p>
                                        <pre className="bg-muted/40 mt-1 overflow-x-auto rounded-lg p-2 text-xs">
                                            {selected.pattern as string}
                                        </pre>
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
