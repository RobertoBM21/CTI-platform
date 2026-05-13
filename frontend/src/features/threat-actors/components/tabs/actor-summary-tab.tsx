'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ObservationWindow } from '@/shared/components/observation-window';
import { SectionCard } from '@/shared/components/section-card';
import { SectionTitle } from '@/shared/components/section-title';
import { SightingCount } from '@/shared/components/sighting-count';
import {
    formatVocabLabel,
    getStixConfig,
    getStixType,
} from '@/shared/lib/stix';
import type { StixObject } from '@/shared/types/entity';
import {
    Brain,
    Bug,
    CalendarDays,
    Cpu,
    ExternalLink,
    Eye,
    FileText,
    Megaphone,
    MessageSquare,
    Shield,
    Target,
    User,
    Zap,
} from 'lucide-react';
import type { ThreatActorDetail } from '../../types';

// ── Kill-chain domain helper ───────────────────────────────────────────

interface KillChainPhase {
    killChainName: string;
    phaseName: string;
}

function isCyberTTP(obj: StixObject): boolean {
    const phases = (obj.killChainPhases as KillChainPhase[] | undefined) ?? [];
    if (phases.length === 0) return true;
    const infoKeywords = [
        'cognitive',
        'info-ops',
        'influence',
        'narrative',
        'disinformation',
    ];
    return !phases.some((p) =>
        infoKeywords.some((k) => p.killChainName.toLowerCase().includes(k)),
    );
}

// ── Dedup helper ──────────────────────────────────────────────────────

function getRelatedByTypes(
    detail: ThreatActorDetail,
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

// ── Small chip ────────────────────────────────────────────────────────

function EntityChip({ obj }: { obj: StixObject }) {
    const cfg = getStixConfig(getStixType(obj.id));
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={{
                borderColor: `${cfg.color}50`,
                color: cfg.color,
                backgroundColor: `${cfg.color}10`,
            }}
        >
            {obj.name ?? getStixType(obj.id)}
        </span>
    );
}

// ── Metadata row ──────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                {label}
            </span>
            <span className="text-right text-sm font-medium">{value}</span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────

interface ActorSummaryTabProps {
    detail: ThreatActorDetail;
}

export function ActorSummaryTab({ detail }: ActorSummaryTabProps) {
    const { entity } = detail;

    const attackPatterns = getRelatedByTypes(detail, ['attack-pattern']);
    const campaigns = getRelatedByTypes(detail, ['campaign']);
    const incidents = getRelatedByTypes(detail, ['incident']);
    const targets = getRelatedByTypes(detail, ['identity']);
    const narratives = getRelatedByTypes(detail, ['note', 'opinion']);
    const cyberAssets = getRelatedByTypes(detail, [
        'malware',
        'tool',
        'vulnerability',
        'infrastructure',
        'intrusion-set',
        'course-of-action',
    ]);

    const cyberTTPs = attackPatterns.filter(isCyberTTP);
    const infoTTPs = attackPatterns.filter((obj) => !isCyberTTP(obj));

    const hasMotivations =
        entity.primaryMotivations.length > 0 ||
        entity.secondaryMotivations.length > 0 ||
        entity.personalMotivations;

    return (
        <div className="space-y-10">
            {/* ── Description ──────────────────────────────────── */}
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

            {/* ── Actor Properties ─────────────────────────────── */}
            <section className="space-y-4">
                <SectionTitle icon={Target} title="Actor Profile" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {entity.threatActorTypes.length > 0 && (
                        <SectionCard icon={Target} label="Actor Types">
                            <div className="flex flex-wrap gap-1.5">
                                {entity.threatActorTypes.map((t) => (
                                    <span
                                        key={t}
                                        className="bg-foreground/8 text-foreground/70 rounded px-2 py-0.5 text-xs font-medium"
                                    >
                                        {formatVocabLabel(t)}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {entity.roles.length > 0 && (
                        <SectionCard icon={User} label="Roles">
                            <div className="flex flex-wrap gap-1.5">
                                {entity.roles.map((r) => (
                                    <span
                                        key={r}
                                        className="bg-foreground/8 text-foreground/70 rounded px-2 py-0.5 text-xs font-medium"
                                    >
                                        {formatVocabLabel(r)}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {entity.aliases.length > 0 && (
                        <SectionCard icon={Shield} label="Known Aliases">
                            <div className="flex flex-wrap gap-1.5">
                                {entity.aliases.map((a) => (
                                    <span
                                        key={a}
                                        className="bg-foreground/8 text-foreground/70 rounded px-2 py-0.5 font-mono text-xs font-medium"
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    <SectionCard icon={Zap} label="Capabilities">
                        <div className="divide-y">
                            {entity.sophistication && (
                                <MetaRow
                                    label="Sophistication"
                                    value={formatVocabLabel(
                                        entity.sophistication,
                                    )}
                                />
                            )}
                            {entity.resourceLevel && (
                                <MetaRow
                                    label="Resource Level"
                                    value={formatVocabLabel(
                                        entity.resourceLevel,
                                    )}
                                />
                            )}
                            {!entity.sophistication &&
                                !entity.resourceLevel && (
                                    <p className="text-foreground/40 text-xs">
                                        Not assessed
                                    </p>
                                )}
                        </div>
                    </SectionCard>

                    {hasMotivations && (
                        <SectionCard icon={Brain} label="Motivations">
                            <div className="space-y-2">
                                {entity.primaryMotivations.length > 0 && (
                                    <div>
                                        <p className="text-foreground/40 mb-1 text-[0.6rem] font-bold tracking-wider uppercase">
                                            Primary
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {entity.primaryMotivations.map(
                                                (m) => (
                                                    <span
                                                        key={m}
                                                        className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium"
                                                    >
                                                        {formatVocabLabel(m)}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                                {entity.secondaryMotivations.length > 0 && (
                                    <div>
                                        <p className="text-foreground/40 mb-1 text-[0.6rem] font-bold tracking-wider uppercase">
                                            Secondary
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {entity.secondaryMotivations.map(
                                                (m) => (
                                                    <span
                                                        key={m}
                                                        className="bg-foreground/8 text-foreground/60 rounded px-2 py-0.5 text-xs font-medium"
                                                    >
                                                        {formatVocabLabel(m)}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                                {entity.personalMotivations && (
                                    <p className="text-foreground/60 text-xs">
                                        {entity.personalMotivations}
                                    </p>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {targets.length > 0 && (
                        <SectionCard icon={Target} label="Primary Targets">
                            {targets.map((obj) => (
                                <EntityChip key={obj.id} obj={obj} />
                            ))}
                        </SectionCard>
                    )}
                </div>
            </section>

            {/* ── Cyber Assets ──────────────────────────────────── */}
            {cyberAssets.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={Bug} title="Cyber Assets" />
                    <div className="flex flex-wrap gap-2">
                        {cyberAssets.map((obj) => (
                            <EntityChip key={obj.id} obj={obj} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Goals ────────────────────────────────────────── */}
            {entity.goals && (
                <section className="space-y-3">
                    <SectionTitle icon={Target} title="Goals" />
                    <Card className="gap-0 rounded-xl py-0 shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-foreground/80 leading-relaxed">
                                {entity.goals}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* ── Related Campaigns & Incidents ────────────────── */}
            {(campaigns.length > 0 || incidents.length > 0) && (
                <section className="space-y-4">
                    <SectionTitle
                        icon={Megaphone}
                        title="Campaigns &amp; Incidents"
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {campaigns.length > 0 && (
                            <SectionCard
                                icon={Megaphone}
                                label="Campaigns"
                                iconClassName="text-sky-600"
                                labelClassName="text-sky-600"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {campaigns.map((obj) => (
                                        <EntityChip key={obj.id} obj={obj} />
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                        {incidents.length > 0 && (
                            <SectionCard
                                icon={Shield}
                                label="Incidents"
                                iconClassName="text-primary"
                                labelClassName="text-primary"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {incidents.map((obj) => (
                                        <EntityChip key={obj.id} obj={obj} />
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                    </div>
                </section>
            )}

            {/* ── TTPs ─────────────────────────────────────────── */}
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
                                        (obj.killChainPhases as
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
                                                    {p.phaseName}
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
                                        (obj.killChainPhases as
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
                                                    {p.phaseName}
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

            {/* ── Narratives ───────────────────────────────────── */}
            {narratives.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle
                        icon={MessageSquare}
                        title="Narratives &amp; Info Assets"
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {narratives.map((obj) => (
                            <SectionCard
                                key={obj.id}
                                icon={MessageSquare}
                                label={getStixConfig(getStixType(obj.id)).label}
                            >
                                <p className="text-sm font-semibold">
                                    {(obj.abstract as string | undefined) ??
                                        obj.name ??
                                        getStixType(obj.id)}
                                </p>
                                {((obj.content as string | undefined) ??
                                    obj.description) && (
                                    <p className="text-foreground/60 mt-1.5 text-xs leading-snug">
                                        {(obj.content as string | undefined) ??
                                            obj.description}
                                    </p>
                                )}
                            </SectionCard>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Observation Window ───────────────────────────── */}
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

            {/* ── Sightings ────────────────────────────────────── */}
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

            {/* ── External References ──────────────────────────── */}
            {entity.externalReferences.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={ExternalLink} title="References" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {entity.externalReferences.map((ref, i) => (
                            <div
                                key={i}
                                className="bg-card relative overflow-hidden rounded-xl border shadow-sm"
                            >
                                <div className="bg-foreground/20 absolute top-0 bottom-0 left-0 w-1" />
                                <div className="p-5 pl-6">
                                    <p className="text-foreground/40 mb-3 text-[0.65rem] font-bold tracking-widest uppercase">
                                        {ref.sourceName}
                                    </p>
                                    <div className="divide-y">
                                        {ref.externalId && (
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                                    ID
                                                </span>
                                                <span className="font-mono text-xs font-bold">
                                                    {ref.externalId}
                                                </span>
                                            </div>
                                        )}
                                        {ref.url && (
                                            <div className="flex items-center justify-between gap-4 py-2">
                                                <span className="text-foreground/40 text-[0.65rem] font-semibold tracking-wider uppercase">
                                                    URL
                                                </span>
                                                <a
                                                    href={ref.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary max-w-50 truncate text-xs underline-offset-2 hover:underline"
                                                >
                                                    {ref.url}
                                                </a>
                                            </div>
                                        )}
                                        {ref.description && (
                                            <p className="text-foreground/60 py-2 text-xs leading-snug">
                                                {ref.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
