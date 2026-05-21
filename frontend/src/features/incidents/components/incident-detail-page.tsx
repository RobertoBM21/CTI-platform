'use client';

import { DetailPageHeader } from '@/shared/components/detail-page-header';
import { DetailTabNav } from '@/shared/components/detail-tab-nav';
import { EntityInfoCard } from '@/shared/components/entity-info-card';
import {
    DetailErrorState,
    DetailLoadingState,
} from '@/shared/components/error-state';
import { ArtifactsTab } from '@/shared/components/tabs/artifacts-tab';
import { ExecutiveSummaryTab } from '@/shared/components/tabs/executive-summary-tab';
import { MapTab } from '@/shared/components/tabs/map-tab';
import { NetworkGraphTab } from '@/shared/components/tabs/network-graph-tab';
import { TimelineTab } from '@/shared/components/tabs/timeline-tab';
import { useDetailNavigationContext } from '@/shared/hooks/use-detail-navigation-context';
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
import { getStixType } from '@/shared/lib/stix';
import { TLP } from '@/shared/types/enums';
import { Activity, Clock, FileText, Link2, MapPin } from 'lucide-react';
import { useIncidentDetail } from '../hooks/use-incident-detail';
import { IncidentPdfDocument } from './incident-pdf-document';

const TABS = [
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'network', label: 'Network Analysis', icon: Activity },
    { id: 'artifacts', label: 'Artifacts & IOCs', icon: Link2 },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'timeline', label: 'Audit & Timeline', icon: Clock },
] as const;

interface IncidentDetailPageProps {
    id: string;
}

export function IncidentDetailPage({ id }: IncidentDetailPageProps) {
    const [activeTab, setActiveTab] = useDetailTab(TABS);
    const { data, isLoading, isError } = useIncidentDetail(id);
    const { backPath } = useDetailNavigationContext('/incidents');
    useEntityPageTitle(data?.entity?.name);

    async function handleExportPdf() {
        if (!data) return;
        await downloadPdf(
            <IncidentPdfDocument detail={data} />,
            toFilename(data.entity.name, '.pdf'),
        );
    }

    function handleExportJson() {
        if (!data) return;
        const { entity, relatedObjects, sightings } = data;
        const bundle = buildStixBundle([
            {
                type: 'incident',
                spec_version: '2.1',
                id: entity.id,
                name: entity.name,
                description: entity.description ?? undefined,
                first_seen: entity.firstSeen ?? undefined,
                last_seen: entity.lastSeen ?? undefined,
                objective: entity.objective ?? undefined,
                confidence: entity.confidence ?? undefined,
                revoked: entity.revoked,
                external_references:
                    entity.externalReferences.length > 0
                        ? entity.externalReferences
                        : undefined,
                created: entity.createdAt,
                modified: entity.updatedAt,
                created_by_ref: entity.createdBy ?? undefined,
            },
            ...buildSroObjects(relatedObjects),
            ...buildRelatedSdos(relatedObjects),
            ...buildSightingObjects(sightings),
        ]);
        downloadJson(bundle, toFilename(entity.name, '.stix.json'));
    }

    if (isLoading) {
        return <DetailLoadingState message="Loading incident…" />;
    }

    if (isError || !data) {
        return (
            <DetailErrorState
                message="Failed to load the requested incident."
                backPath={backPath}
                backLabel="Back to catalog"
            />
        );
    }

    const { entity } = data;
    const primaryRef = entity.externalReferences[0];

    const seen = new Set<string>();
    const dedup = (objs: (typeof data.relatedObjects)[0]['object'][]) =>
        objs.filter((o): o is NonNullable<typeof o> => {
            if (!o || seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
        });

    const attackPatterns = dedup(
        data.relatedObjects
            .filter(
                ({ object }) =>
                    object && getStixType(object.id) === 'attack-pattern',
            )
            .map(({ object }) => object),
    );
    const campaigns = dedup(
        data.relatedObjects
            .filter(
                ({ object }) => object && getStixType(object.id) === 'campaign',
            )
            .map(({ object }) => object),
    );
    const tags = [...attackPatterns, ...campaigns];

    return (
        <div className="flex min-h-full flex-col">
            {/* ── Sticky action bar ───────────────────────────── */}
            <DetailPageHeader
                entityTypeLabel="INCIDENT"
                backPath={backPath}
                name={entity.name}
                tlp={entity.tlp as TLP}
                confidence={entity.confidence}
                onExportPdf={handleExportPdf}
                onExportJson={handleExportJson}
            />

            {/* ── Page content ─────────────────────────────────── */}
            <div className="flex-1 space-y-6 px-6 py-6 lg:px-10">
                {/* ── Info card ─────────────────────────────────── */}
                <EntityInfoCard
                    name={entity.name}
                    description={entity.description}
                    confidence={entity.confidence}
                    createdAt={entity.createdAt}
                    updatedAt={entity.updatedAt}
                    primaryRef={primaryRef}
                    tags={tags}
                />

                <DetailTabNav
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    ariaLabel="Incident detail tabs"
                />

                {/* ── Tab content ─────────────────────────────── */}
                <div className="pb-12">
                    {activeTab === 'summary' && (
                        <ExecutiveSummaryTab detail={data} />
                    )}
                    {activeTab === 'network' && (
                        <NetworkGraphTab detail={data} />
                    )}
                    {activeTab === 'artifacts' && (
                        <ArtifactsTab detail={data} />
                    )}
                    {activeTab === 'map' && <MapTab detail={data} />}
                    {activeTab === 'timeline' && <TimelineTab detail={data} />}
                </div>
            </div>
        </div>
    );
}
