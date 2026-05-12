'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, getStixConfig, getStixType } from '@/shared/lib/stix';
import type {
    EntityBase,
    EntityDetail,
    StixExternalRef,
    StixObject,
} from '@/shared/types/entity';
import {
    Brain,
    Building2,
    CalendarDays,
    Cpu,
    ExternalLink,
    Eye,
    FileText,
    MapPin,
    MessageSquare,
    Target,
    User,
} from 'lucide-react';
import type React from 'react';

// ── Extended entity base for summary tabs ─────────────────────────────

export interface SummaryEntityBase extends EntityBase {
    objective?: string;
    externalReferences?: StixExternalRef[];
    tlp?: string;
}

// ── Kill-chain helper ─────────────────────────────────────────────────

interface KillChainPhase {
    kill_chain_name: string;
    phase_name: string;
}

function isCyberTTP(obj: StixObject): boolean {
    const phases =
        (obj.kill_chain_phases as KillChainPhase[] | undefined) ?? [];
    if (phases.length === 0) return true;
    const infoKeywords = [
        'cognitive',
        'info-ops',
        'influence',
        'narrative',
        'disinformation',
    ];
    return !phases.some((p) =>
        infoKeywords.some((k) => p.kill_chain_name.toLowerCase().includes(k)),
    );
}

// ── Generic helper ────────────────────────────────────────────────────

function getRelatedByTypes<TEntity extends SummaryEntityBase>(
    detail: EntityDetail<TEntity>,
    types: string[],
): StixObject[] {
    const seen = new Set<string>();
    return detail.relatedObjects
        .filter(
            ({ object }) => object && types.includes(getStixType(object.id)),
        )
        .map(({ object }) => object!)
        .filter((obj) => {
            if (seen.has(obj.id)) return false;
            seen.add(obj.id);
            return true;
        });
}

// ── Component ─────────────────────────────────────────────────────────

interface ExecutiveSummaryTabProps<
    TEntity extends SummaryEntityBase = SummaryEntityBase,
> {
    detail: EntityDetail<TEntity>;
}

export function ExecutiveSummaryTab<
    TEntity extends SummaryEntityBase = SummaryEntityBase,
>({ detail }: ExecutiveSummaryTabProps<TEntity>) {
    const { entity } = detail;

    const entityTypeLabel = getStixConfig(getStixType(entity.id)).label;
    const externalRefs = entity.externalReferences ?? [];
    const primaryRef = externalRefs[0];
    const primarySource = primaryRef?.sourceName ?? '';

    const threatActors = getRelatedByTypes(detail, [
        'threat-actor',
        'intrusion-set',
    ]);
    const locations = getRelatedByTypes(detail, ['location']);
    const targets = getRelatedByTypes(detail, ['identity']);
    const campaigns = getRelatedByTypes(detail, ['campaign']);
    const attackPatterns = getRelatedByTypes(detail, ['attack-pattern']);
    const relatedIncidents = getRelatedByTypes(detail, ['incident']);

    const cyberTTPs = attackPatterns.filter(isCyberTTP);
    const infoTTPs = attackPatterns.filter((obj) => !isCyberTTP(obj));

    const narratives = getRelatedByTypes(detail, ['note', 'opinion']);

    return (
        <div className="space-y-10">
            {entity.description && (
                <section className="space-y-3">
                    <SectionTitle icon={FileText} title="Description" />
                    <Card className="gap-0 rounded-xl py-0 shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-foreground/80 leading-relaxed">
                                {entity.description}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}

            {entity.objective && (
                <section className="space-y-3">
                    <SectionTitle icon={FileText} title="Objective" />
                    <Card className="gap-0 rounded-xl py-0 shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-foreground/80 leading-relaxed">
                                {entity.objective}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}

            <section className="space-y-4">
                <SectionTitle icon={Target} title={`${entityTypeLabel} Data`} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DataCard
                        icon={Target}
                        label="Threat Actor"
                        empty={threatActors.length === 0}
                    >
                        {threatActors.map((obj) => (
                            <EntityChip key={obj.id} obj={obj} />
                        ))}
                    </DataCard>

                    <DataCard
                        icon={MapPin}
                        label="Location"
                        empty={locations.length === 0}
                    >
                        <span className="text-sm font-semibold">
                            {locations
                                .map((l) => l.name ?? getStixType(l.id))
                                .join(', ') || '—'}
                        </span>
                    </DataCard>

                    <DataCard
                        icon={User}
                        label="Target Audience"
                        empty={targets.length === 0}
                    >
                        {targets.map((obj) => (
                            <EntityChip key={obj.id} obj={obj} />
                        ))}
                    </DataCard>

                    {(campaigns.length > 0 || attackPatterns.length > 0) && (
                        <DataCard
                            icon={FileText}
                            label="Campaigns / Attack Patterns"
                            empty={false}
                        >
                            {[...campaigns, ...attackPatterns].map((obj) => (
                                <EntityChip key={obj.id} obj={obj} />
                            ))}
                        </DataCard>
                    )}

                    {relatedIncidents.length > 0 && (
                        <DataCard
                            icon={FileText}
                            label="Related Incidents"
                            empty={false}
                        >
                            {relatedIncidents.map((obj) => (
                                <EntityChip key={obj.id} obj={obj} />
                            ))}
                        </DataCard>
                    )}
                </div>
            </section>

            {attackPatterns.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle
                        icon={Cpu}
                        title="TTPs &amp; Planning Phases"
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Card className="gap-0 rounded-xl py-0 shadow-sm">
                            <CardHeader className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    <Cpu className="text-primary size-3.5" />
                                    <span className="text-primary text-[0.65rem] font-bold tracking-widest uppercase">
                                        Cyber
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pt-0 pb-4">
                                {cyberTTPs.length === 0 ? (
                                    <span className="text-foreground/30 text-sm italic">
                                        —
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {cyberTTPs.map((obj) => {
                                            const phases =
                                                (obj.kill_chain_phases as
                                                    | KillChainPhase[]
                                                    | undefined) ?? [];
                                            return (
                                                <div
                                                    key={obj.id}
                                                    className="flex flex-col items-start gap-0.5"
                                                >
                                                    <EntityChip obj={obj} />
                                                    {phases.map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-foreground/40 pl-1 text-[0.6rem]"
                                                        >
                                                            {p.phase_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-0 rounded-xl py-0 shadow-sm">
                            <CardHeader className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    <Brain className="size-3.5 text-violet-600" />
                                    <span className="text-[0.65rem] font-bold tracking-widest text-violet-600 uppercase">
                                        Info
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pt-0 pb-4">
                                {infoTTPs.length === 0 ? (
                                    <span className="text-foreground/30 text-sm italic">
                                        —
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {infoTTPs.map((obj) => {
                                            const phases =
                                                (obj.kill_chain_phases as
                                                    | KillChainPhase[]
                                                    | undefined) ?? [];
                                            return (
                                                <div
                                                    key={obj.id}
                                                    className="flex flex-col items-start gap-0.5"
                                                >
                                                    <EntityChip obj={obj} />
                                                    {phases.map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-foreground/40 pl-1 text-[0.6rem]"
                                                        >
                                                            {p.phase_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {narratives.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle
                        icon={MessageSquare}
                        title="Narratives &amp; Cognitive Assets"
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {narratives.map((obj) => (
                            <Card
                                key={obj.id}
                                className="gap-0 rounded-xl py-0 shadow-sm"
                            >
                                <CardHeader className="px-5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="text-foreground/40 size-3.5" />
                                        <span className="text-foreground/40 text-[0.65rem] font-bold tracking-widest uppercase">
                                            {getStixConfig(obj.id).label}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pt-0 pb-5">
                                    <p className="text-sm font-semibold">
                                        {obj.name ?? getStixType(obj.id)}
                                    </p>
                                    {obj.description && (
                                        <p className="text-foreground/60 mt-1.5 text-xs leading-snug">
                                            {obj.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {(entity.firstSeen ?? entity.lastSeen) && (
                <section className="space-y-3">
                    <SectionTitle
                        icon={CalendarDays}
                        title="Observation Window"
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {entity.firstSeen && (
                            <div className="bg-card flex items-start gap-4 rounded-xl border px-6 py-5 shadow-sm">
                                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                                    <CalendarDays className="text-foreground/50 size-5" />
                                </div>
                                <div>
                                    <p className="text-foreground/40 mb-0.5 text-[0.6rem] font-bold tracking-widest uppercase">
                                        First Seen
                                    </p>
                                    <p className="font-bold">
                                        {formatDate(entity.firstSeen)}
                                    </p>
                                </div>
                            </div>
                        )}
                        {entity.lastSeen && (
                            <div className="bg-card flex items-start gap-4 rounded-xl border px-6 py-5 shadow-sm">
                                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                                    <CalendarDays className="text-foreground/50 size-5" />
                                </div>
                                <div>
                                    <p className="text-foreground/40 mb-0.5 text-[0.6rem] font-bold tracking-widest uppercase">
                                        Last Seen
                                    </p>
                                    <p className="font-bold">
                                        {formatDate(entity.lastSeen)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {detail.sightings.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={Eye} title="Sightings" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {detail.sightings.map((s) => (
                            <Card
                                key={s.id}
                                className="gap-0 rounded-xl py-0 shadow-sm"
                            >
                                <CardHeader className="px-5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="text-foreground/40 size-3.5" />
                                        <span className="text-foreground/50 text-[0.6rem] font-bold tracking-widest uppercase">
                                            Sighting
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pt-0 pb-5">
                                    <p className="text-foreground/80 text-lg font-bold">
                                        {s.count}
                                        <span className="text-foreground/40 ml-1 text-xs font-normal">
                                            occurrence
                                            {s.count !== 1 ? 's' : ''}
                                        </span>
                                    </p>
                                    {(s.firstSeen ?? s.lastSeen) && (
                                        <p className="text-foreground/50 mt-1 text-xs">
                                            {s.firstSeen &&
                                                formatDate(s.firstSeen)}
                                            {s.firstSeen && s.lastSeen && ' → '}
                                            {s.lastSeen &&
                                                formatDate(s.lastSeen)}
                                        </p>
                                    )}
                                    {s.description && (
                                        <p className="text-foreground/60 mt-1.5 text-xs leading-snug">
                                            {s.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {externalRefs.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={ExternalLink} title="References" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="bg-card relative overflow-hidden rounded-xl border shadow-sm">
                            <div className="bg-foreground/20 absolute top-0 bottom-0 left-0 w-1" />
                            <div className="p-5 pl-6">
                                <p className="text-foreground/40 mb-4 text-[0.65rem] font-bold tracking-widest uppercase">
                                    Original Author
                                </p>
                                <div className="divide-y">
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                            Name
                                        </span>
                                        <span className="bg-foreground/10 text-foreground rounded px-2.5 py-1 text-xs font-bold">
                                            {primarySource}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                            Organization
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="text-foreground/50 size-3.5" />
                                            <span>{primarySource}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                            Creation Date
                                        </span>
                                        <span>
                                            {formatDate(entity.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card relative overflow-hidden rounded-xl border shadow-sm">
                            <div className="bg-primary absolute top-0 bottom-0 left-0 w-1" />
                            <div className="p-5 pl-6">
                                <p className="text-foreground/40 mb-4 text-[0.65rem] font-bold tracking-widest uppercase">
                                    Last Modified
                                </p>
                                <div className="divide-y">
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                            Name
                                        </span>
                                        <span className="bg-primary/15 text-primary rounded px-2.5 py-1 text-xs font-bold">
                                            {primarySource}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                            Organization
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="text-foreground/50 size-3.5" />
                                            <span>{primarySource}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                            Modification Date
                                        </span>
                                        <span>
                                            {formatDate(entity.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                                {externalRefs.some((r) => r.url) && (
                                    <div className="border-t pt-3">
                                        <p className="text-foreground/40 mb-2 text-[0.65rem] font-bold tracking-widest uppercase">
                                            Sources
                                        </p>
                                        <ul className="space-y-1">
                                            {externalRefs
                                                .filter((r) => r.url)
                                                .map((ref, idx) => (
                                                    <li key={idx}>
                                                        <a
                                                            href={ref.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary text-sm hover:underline"
                                                        >
                                                            {ref.externalId ??
                                                                ref.sourceName}
                                                        </a>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────

function SectionTitle({
    icon: Icon,
    title,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="text-primary size-4" />
            <h3 className="text-foreground/40 text-xs font-bold tracking-widest uppercase">
                {title}
            </h3>
        </div>
    );
}

function DataCard({
    icon: Icon,
    label,
    empty,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    empty: boolean;
    children?: React.ReactNode;
}) {
    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                    <Icon className="text-foreground/40 size-3.5" />
                    <span className="text-foreground/40 text-[0.65rem] font-bold tracking-widest uppercase">
                        {label}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-5 pt-0 pb-5">
                {empty ? (
                    <span className="text-foreground/30 italic">—</span>
                ) : (
                    <div className="flex flex-wrap gap-1.5">{children}</div>
                )}
            </CardContent>
        </Card>
    );
}

function EntityChip({ obj }: { obj: StixObject }) {
    const config = getStixConfig(obj.id);
    return (
        <span
            className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold"
            style={{
                backgroundColor: `${config.color}18`,
                color: config.color,
            }}
        >
            {obj.name ?? obj.id.split('--')[1]?.substring(0, 8) ?? obj.id}
        </span>
    );
}
