'use client';

import { SectionTitle } from '@/shared/components/section-title';
import { ArtifactsTab } from '@/shared/components/tabs/artifacts-tab';
import { NetworkGraphTab } from '@/shared/components/tabs/network-graph-tab';
import { getStixConfig, getStixType } from '@/shared/lib/stix';
import type { EntityDetail, StixObject } from '@/shared/types/entity';
import { Cpu, Network, Shield, Target } from 'lucide-react';
import type { ThreatActorDetail, ThreatActorDetailEntity } from '../../types';

// ── Kill-chain domain helper ───────────────────────────────────────────

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

const CYBER_STIX_TYPES = new Set([
    'malware',
    'tool',
    'vulnerability',
    'infrastructure',
    'malware-analysis',
    'observed-data',
    'intrusion-set',
    'course-of-action',
    'indicator',
]);

function isCyberObject(obj: StixObject): boolean {
    const t = getStixType(obj.id);
    if (CYBER_STIX_TYPES.has(t)) return true;
    if (t === 'attack-pattern') return isCyberTTP(obj);
    return false;
}

// ── Build a filtered detail with only cyber-domain objects ────────────

function buildCyberDetail(
    detail: ThreatActorDetail,
): EntityDetail<ThreatActorDetailEntity> {
    const filtered = detail.relatedObjects.filter(
        ({ object }) => object && isCyberObject(object),
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

interface ActorCyberTabProps {
    detail: ThreatActorDetail;
}

export function ActorCyberTab({ detail }: ActorCyberTabProps) {
    const cyberDetail = buildCyberDetail(detail);

    const seen = new Set<string>();
    function dedup(objs: StixObject[]): StixObject[] {
        return objs.filter((o) => {
            if (seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
        });
    }

    const cyberTTPs = dedup(
        detail.relatedObjects
            .filter(
                ({ object }) =>
                    object &&
                    getStixType(object.id) === 'attack-pattern' &&
                    isCyberTTP(object),
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

    return (
        <div className="space-y-10">
            {/* ── Cyber TTPs ───────────────────────────────────── */}
            {cyberTTPs.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle icon={Cpu} title="Cyber TTPs" />
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

            {/* ── Cyber Artifacts & IOCs ────────────────────────── */}
            <section className="space-y-4">
                <SectionTitle
                    icon={Shield}
                    title="Cyber Artifacts &amp; IOCs"
                />
                <ArtifactsTab detail={cyberDetail} />
            </section>

            {/* ── Cyber Network Graph ──────────────────────────── */}
            <section className="space-y-4">
                <SectionTitle icon={Network} title="Cyber Network Graph" />
                <NetworkGraphTab detail={cyberDetail} />
            </section>
        </div>
    );
}
