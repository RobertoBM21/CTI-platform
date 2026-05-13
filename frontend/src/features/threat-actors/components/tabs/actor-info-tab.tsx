'use client';

import { SectionCard } from '@/shared/components/section-card';
import { SectionTitle } from '@/shared/components/section-title';
import { NetworkGraphTab } from '@/shared/components/tabs/network-graph-tab';
import { getStixConfig, getStixType } from '@/shared/lib/stix';
import type { EntityDetail, StixObject } from '@/shared/types/entity';
import { Brain, MessageSquare, Network, Target } from 'lucide-react';
import type { ThreatActorDetail, ThreatActorDetailEntity } from '../../types';

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

const INFO_STIX_TYPES = new Set(['note', 'opinion']);

function isInfoObject(obj: StixObject): boolean {
    const t = getStixType(obj.id);
    if (INFO_STIX_TYPES.has(t)) return true;
    if (t === 'attack-pattern') return !isCyberTTP(obj);
    return false;
}

// ── Build a filtered detail with only info-domain objects ─────────────

function buildInfoDetail(
    detail: ThreatActorDetail,
): EntityDetail<ThreatActorDetailEntity> {
    const filtered = detail.relatedObjects.filter(
        ({ object }) => object && isInfoObject(object),
    );
    return { ...detail, relatedObjects: filtered };
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

// ── Main component ────────────────────────────────────────────────────

interface ActorInfoTabProps {
    detail: ThreatActorDetail;
}

export function ActorInfoTab({ detail }: ActorInfoTabProps) {
    const infoDetail = buildInfoDetail(detail);

    const seen = new Set<string>();
    function dedup(objs: StixObject[]): StixObject[] {
        return objs.filter((o) => {
            if (seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
        });
    }

    const infoTTPs = dedup(
        detail.relatedObjects
            .filter(
                ({ object }) =>
                    object &&
                    getStixType(object.id) === 'attack-pattern' &&
                    !isCyberTTP(object),
            )
            .map(({ object }) => object!),
    );

    const narratives = dedup(
        detail.relatedObjects
            .filter(
                ({ object }) =>
                    object && INFO_STIX_TYPES.has(getStixType(object.id)),
            )
            .map(({ object }) => object!),
    );

    const targets = dedup(
        detail.relatedObjects
            .filter(
                ({ object }) =>
                    object &&
                    (getStixType(object.id) === 'identity' ||
                        getStixType(object.id) === 'location'),
            )
            .map(({ object }) => object!),
    );

    const hasContent =
        infoTTPs.length > 0 ||
        narratives.length > 0 ||
        infoDetail.relatedObjects.length > 0;

    return (
        <div className="space-y-10">
            {/* ── Info TTPs ────────────────────────────────────── */}
            {infoTTPs.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={Brain} title="Info-Ops TTPs" />
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
                </section>
            )}

            {/* ── Targets ─────────────────────────────────────── */}
            {targets.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={Target} title="Targets" />
                    <div className="flex flex-wrap gap-2">
                        {targets.map((obj) => (
                            <EntityChip key={obj.id} obj={obj} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Narratives & Info Assets ──────────────────────── */}
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

            {/* ── Social / Info Graph ──────────────────────────── */}
            <section className="space-y-4">
                <SectionTitle icon={Network} title="Social &amp; Info Graph" />
                {hasContent ? (
                    <NetworkGraphTab detail={infoDetail} />
                ) : (
                    <div className="bg-card rounded-2xl border py-12 text-center">
                        <p className="text-foreground/40 text-sm">
                            No info-ops objects linked to this actor.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
