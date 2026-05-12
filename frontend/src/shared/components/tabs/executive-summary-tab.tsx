'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ObservationWindow } from '@/shared/components/observation-window';
import { SectionCard } from '@/shared/components/section-card';
import { SectionTitle } from '@/shared/components/section-title';
import { SightingCount } from '@/shared/components/sighting-count';
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
                        <SectionCard
                            icon={Cpu}
                            label="Cyber"
                            iconClassName="text-primary"
                            labelClassName="text-primary"
                            empty={cyberTTPs.length === 0}
                        >
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
                        </SectionCard>

                        <SectionCard
                            icon={Brain}
                            label="Info"
                            iconClassName="text-violet-600"
                            labelClassName="text-violet-600"
                            empty={infoTTPs.length === 0}
                        >
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
                        </SectionCard>
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
                            <SectionCard
                                key={obj.id}
                                icon={MessageSquare}
                                label={getStixConfig(obj.id).label}
                            >
                                <p className="text-sm font-semibold">
                                    {obj.name ?? getStixType(obj.id)}
                                </p>
                                {obj.description && (
                                    <p className="text-foreground/60 mt-1.5 text-xs leading-snug">
                                        {obj.description}
                                    </p>
                                )}
                            </SectionCard>
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
                    <ObservationWindow
                        firstSeen={entity.firstSeen}
                        lastSeen={entity.lastSeen}
                    />
                </section>
            )}

            {detail.sightings.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={Eye} title="Sightings" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {detail.sightings.map((s) => (
                            <SightingCount key={s.id} {...s} />
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

function DataCard({
    icon,
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
        <SectionCard icon={icon} label={label} empty={empty}>
            <div className="flex flex-wrap gap-1.5">{children}</div>
        </SectionCard>
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
