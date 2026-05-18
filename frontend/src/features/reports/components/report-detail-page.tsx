'use client';

import { DetailPageHeader } from '@/shared/components/detail-page-header';
import { DetailTabNav } from '@/shared/components/detail-tab-nav';
import { EntityInfoCard } from '@/shared/components/entity-info-card';
import {
    DetailErrorState,
    DetailLoadingState,
} from '@/shared/components/error-state';
import { SectionCard } from '@/shared/components/section-card';
import { ArtifactsTab } from '@/shared/components/tabs/artifacts-tab';
import { MapTab } from '@/shared/components/tabs/map-tab';
import { NetworkGraphTab } from '@/shared/components/tabs/network-graph-tab';
import { useDetailTab } from '@/shared/hooks/use-detail-tab';
import { useEntityPageTitle } from '@/shared/hooks/use-entity-page-title';
import {
    buildRelatedSdos,
    buildSightingObjects,
    buildSroObjects,
    buildStixBundle,
    downloadJson,
    downloadPdf,
    toFilename,
} from '@/shared/lib/export-utils';
import { formatDate, formatVocabLabel, getStixConfig } from '@/shared/lib/stix';
import { TLP } from '@/shared/types/enums';
import {
    Activity,
    AlertTriangle,
    BookOpen,
    Crosshair,
    ExternalLink,
    FileText,
    Link2,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useReportDetail } from '../hooks/use-report-detail';
import type { ReportDetail, StixObject } from '../types';
import { ReportPdfDocument } from './report-pdf-document';

// ── Tab definitions ────────────────────────────────────────────────────

const TABS = [
    { id: 'summary', label: 'Executive Summary', icon: BookOpen },
    { id: 'actors', label: 'Actors', icon: Users },
    { id: 'targets', label: 'Targets', icon: Crosshair },
    { id: 'artifacts', label: 'Artifacts', icon: Link2 },
    { id: 'graph', label: 'Graph', icon: Activity },
] as const;

// ── Global report info (above tabs) ───────────────────────────────────

function ReportGlobalInfo({ detail }: { detail: ReportDetail }) {
    const { entity } = detail;
    const primaryRef = entity.externalReferences[0];

    return (
        <div className="space-y-4">
            {entity.revoked && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>
                        <p className="font-semibold">Revoked report</p>
                        <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                            This report has been officially withdrawn and may
                            have been superseded by a newer version. Treat its
                            contents with caution.
                        </p>
                    </div>
                </div>
            )}
            <EntityInfoCard
                name={entity.name}
                description={entity.description}
                confidence={entity.confidence}
                createdAt={entity.createdAt}
                updatedAt={entity.updatedAt}
                primaryRef={primaryRef}
                tags={[]}
            />
        </div>
    );
}

// ── Tab: Executive Summary ─────────────────────────────────────────────

function ReportSummaryTab({ detail }: { detail: ReportDetail }) {
    const { entity, relatedObjects, sightings } = detail;

    return (
        <div className="space-y-6">
            {/* Report type badges */}
            {entity.reportTypes.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <FileText className="text-muted-foreground size-3.5" />
                        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Report Types
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {entity.reportTypes.map((rt) => {
                            const cfg = getStixConfig(rt);
                            return (
                                <span
                                    key={rt}
                                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                                    style={{
                                        borderColor: `${cfg.color}50`,
                                        color: cfg.color,
                                        backgroundColor: `${cfg.color}10`,
                                    }}
                                >
                                    {formatVocabLabel(rt)}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Referenced Objects */}
            {entity.objectRefs.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <BookOpen className="text-muted-foreground size-4" />
                        <h3 className="text-sm font-semibold">
                            Referenced Objects ({entity.objectRefs.length})
                        </h3>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {entity.objectRefs.map((obj: StixObject) => (
                            <div
                                key={obj.id}
                                className="bg-card rounded-lg border p-3"
                            >
                                <p className="text-muted-foreground mb-1 text-[0.65rem] font-bold tracking-wider uppercase">
                                    {obj.id.split('--')[0]}
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {obj.name ?? obj.id}
                                </p>
                                {obj.description && (
                                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                        {obj.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {relatedObjects.length > 0 && (
                <SectionCard
                    icon={Activity}
                    label={`Related Objects (${relatedObjects.length})`}
                >
                    <div className="mt-3 space-y-2">
                        {relatedObjects.map(({ relationship, object }) => (
                            <div
                                key={relationship.id}
                                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">
                                        {formatVocabLabel(
                                            relationship.relationshipType,
                                        )}
                                    </span>
                                    <span className="font-medium">
                                        {object?.name ?? object?.id ?? '—'}
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-xs">
                                    {object?.id.split('--')[0] ?? ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {sightings.length > 0 && (
                <SectionCard
                    icon={Activity}
                    label={`Sightings (${sightings.length})`}
                >
                    <div className="mt-3 space-y-2">
                        {sightings.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            >
                                <span className="text-muted-foreground text-xs">
                                    {s.firstSeen
                                        ? formatDate(s.firstSeen)
                                        : '—'}
                                </span>
                                <span className="font-medium">
                                    ×{s.count} sightings
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {relatedObjects.length === 0 &&
                sightings.length === 0 &&
                entity.objectRefs.length === 0 && (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        No related intelligence available for this report.
                    </p>
                )}

            {/* External references summary */}
            {entity.externalReferences.length > 0 && (
                <SectionCard
                    icon={ExternalLink}
                    label={`Sources (${entity.externalReferences.length})`}
                >
                    <div className="mt-3 space-y-2">
                        {entity.externalReferences.map((ref, idx) => (
                            <div key={idx} className="text-sm">
                                <p className="font-medium">{ref.sourceName}</p>
                                {ref.externalId && (
                                    <p className="text-muted-foreground text-xs">
                                        {ref.externalId}
                                    </p>
                                )}
                                {ref.url && (
                                    <a
                                        href={ref.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary text-xs hover:underline"
                                    >
                                        {ref.url}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}

// ── Tab: Actores ───────────────────────────────────────────────────────

const ACTOR_TYPES = new Set(['threat-actor', 'campaign', 'intrusion-set']);

function ReportActorsTab({ detail }: { detail: ReportDetail }) {
    const { entity, relatedObjects } = detail;

    const actorRefs = entity.objectRefs.filter((obj: StixObject) =>
        ACTOR_TYPES.has(obj.id.split('--')[0] ?? ''),
    );

    const relatedActors = relatedObjects.filter(
        ({ object }) =>
            object && ACTOR_TYPES.has(object.id.split('--')[0] ?? ''),
    );

    if (actorRefs.length === 0 && relatedActors.length === 0) {
        return (
            <p className="text-muted-foreground py-8 text-center text-sm">
                No threat actors or campaigns referenced in this report.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {actorRefs.length > 0 && (
                <SectionCard
                    icon={Users}
                    label={`Referenced Actors (${actorRefs.length})`}
                >
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {actorRefs.map((obj: StixObject) => (
                            <div
                                key={obj.id}
                                className="bg-card rounded-lg border p-3"
                            >
                                <p className="text-muted-foreground mb-1 text-[0.65rem] font-bold tracking-wider uppercase">
                                    {obj.id.split('--')[0]}
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {obj.name ?? obj.id}
                                </p>
                                {obj.description && (
                                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                        {obj.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {relatedActors.length > 0 && (
                <SectionCard
                    icon={Activity}
                    label={`Related Actors (${relatedActors.length})`}
                >
                    <div className="mt-3 space-y-2">
                        {relatedActors.map(({ relationship, object }) => (
                            <div
                                key={relationship.id}
                                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">
                                        {formatVocabLabel(
                                            relationship.relationshipType,
                                        )}
                                    </span>
                                    <span className="font-medium">
                                        {object?.name ?? object?.id ?? '—'}
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-xs">
                                    {object?.id.split('--')[0] ?? ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── Geographic map ──────────────────── */}
            <MapTab detail={detail} />
        </div>
    );
}

// ── Tab: Targets ───────────────────────────────────────────────────────

const TARGET_TYPES = new Set(['identity', 'location']);

function ReportTargetsTab({ detail }: { detail: ReportDetail }) {
    const { entity, relatedObjects } = detail;

    const targetRefs = entity.objectRefs.filter((obj: StixObject) =>
        TARGET_TYPES.has(obj.id.split('--')[0] ?? ''),
    );

    const relatedTargets = relatedObjects.filter(
        ({ object }) =>
            object && TARGET_TYPES.has(object.id.split('--')[0] ?? ''),
    );

    if (targetRefs.length === 0 && relatedTargets.length === 0) {
        return (
            <p className="text-muted-foreground py-8 text-center text-sm">
                No target identities or locations referenced in this report.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {targetRefs.length > 0 && (
                <SectionCard
                    icon={Crosshair}
                    label={`Referenced Targets (${targetRefs.length})`}
                >
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {targetRefs.map((obj: StixObject) => (
                            <div
                                key={obj.id}
                                className="bg-card rounded-lg border p-3"
                            >
                                <p className="text-muted-foreground mb-1 text-[0.65rem] font-bold tracking-wider uppercase">
                                    {obj.id.split('--')[0]}
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {obj.name ?? obj.id}
                                </p>
                                {obj.description && (
                                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                        {obj.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {relatedTargets.length > 0 && (
                <SectionCard
                    icon={Activity}
                    label={`Related Targets (${relatedTargets.length})`}
                >
                    <div className="mt-3 space-y-2">
                        {relatedTargets.map(({ relationship, object }) => (
                            <div
                                key={relationship.id}
                                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">
                                        {formatVocabLabel(
                                            relationship.relationshipType,
                                        )}
                                    </span>
                                    <span className="font-medium">
                                        {object?.name ?? object?.id ?? '—'}
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-xs">
                                    {object?.id.split('--')[0] ?? ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}

// ── Main detail page ─────────────────────────────────────────────────

interface ReportDetailPageProps {
    id: string;
}

export function ReportDetailPage({ id }: ReportDetailPageProps) {
    const [activeTab, setActiveTab] = useDetailTab(TABS);
    const { data, isLoading, isError } = useReportDetail(id);

    // Augment detail for the graph: treat objectRefs as nodes connected to the
    // report via a synthetic "references" edge so the graph isn't empty.
    const graphDetail = useMemo(() => {
        if (!data) return null;
        const syntheticRels = data.entity.objectRefs.map((obj) => ({
            relationship: {
                id: `ref--${obj.id}`,
                relationshipType: 'references' as const,
                sourceRef: data.entity.id,
                targetRef: obj.id,
                tlp: data.entity.tlp ?? 'white',
                createdAt: data.entity.createdAt,
                updatedAt: data.entity.updatedAt,
            },
            object: obj,
        }));
        return {
            ...data,
            relatedObjects: [...data.relatedObjects, ...syntheticRels],
        };
    }, [data]);
    useEntityPageTitle(data?.entity?.name);

    async function handleExportPdf() {
        if (!data) return;
        await downloadPdf(
            <ReportPdfDocument detail={data} />,
            toFilename(data.entity.name, '.pdf'),
        );
    }

    function handleExportJson() {
        if (!data) return;
        const { entity, relatedObjects, sightings } = data;
        const bundle = buildStixBundle([
            {
                type: 'report',
                spec_version: '2.1',
                id: entity.id,
                name: entity.name,
                description: entity.description ?? undefined,
                published: entity.published,
                report_types: entity.reportTypes,
                object_refs: entity.objectRefs.map((o) => o.id),
                confidence: entity.confidence ?? undefined,
                revoked: entity.revoked,
                external_references:
                    entity.externalReferences.length > 0
                        ? entity.externalReferences
                        : undefined,
                created_by_ref: entity.createdBy ?? undefined,
                created: entity.createdAt,
                modified: entity.updatedAt,
            },
            ...entity.objectRefs,
            ...buildSroObjects(relatedObjects),
            ...buildRelatedSdos(relatedObjects),
            ...buildSightingObjects(sightings),
        ]);
        downloadJson(bundle, toFilename(entity.name, '.stix.json'));
    }

    if (isLoading) {
        return <DetailLoadingState message="Loading report…" />;
    }

    if (isError || !data) {
        return (
            <DetailErrorState
                message="Failed to load the requested report."
                backPath="/reports"
                backLabel="Back to catalog"
            />
        );
    }

    const { entity } = data;

    return (
        <div className="flex min-h-full flex-col">
            {/* ── Sticky action bar ───────────────────────────── */}
            <DetailPageHeader
                entityTypeLabel="REPORT"
                backPath="/reports"
                name={entity.name}
                tlp={entity.tlp as TLP}
                confidence={entity.confidence}
                onExportPdf={handleExportPdf}
                onExportJson={handleExportJson}
            />

            {/* ── Page content ─────────────────────────────────── */}
            <div className="flex-1 space-y-6 px-6 py-6 lg:px-10">
                {' '}
                {/* ── Global report info ────────────────────── */}
                <ReportGlobalInfo detail={data} />
                <DetailTabNav
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    ariaLabel="Report detail tabs"
                />
                {/* ── Tab content ─────────────────────────────── */}
                <div className="pb-12">
                    {activeTab === 'summary' && (
                        <ReportSummaryTab detail={data} />
                    )}
                    {activeTab === 'actors' && (
                        <ReportActorsTab detail={data} />
                    )}
                    {activeTab === 'targets' && (
                        <ReportTargetsTab detail={data} />
                    )}
                    {activeTab === 'artifacts' && (
                        <ArtifactsTab detail={data} />
                    )}
                    {activeTab === 'graph' && graphDetail && (
                        <NetworkGraphTab detail={graphDetail} />
                    )}
                </div>
            </div>
        </div>
    );
}
