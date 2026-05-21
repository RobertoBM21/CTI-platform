'use client';

import { DetailPageHeader } from '@/shared/components/detail-page-header';
import { DetailTabNav } from '@/shared/components/detail-tab-nav';
import { EntityInfoCard } from '@/shared/components/entity-info-card';
import {
    DetailErrorState,
    DetailLoadingState,
} from '@/shared/components/error-state';
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
import { Activity, Brain, Cpu, Globe2 } from 'lucide-react';
import { useThreatActorDetail } from '../hooks/use-threat-actor-detail';
import { ActorCyberTab } from './tabs/actor-cyber-tab';
import { ActorHybridTab } from './tabs/actor-hybrid-tab';
import { ActorInfoTab } from './tabs/actor-info-tab';
import { ActorSummaryTab } from './tabs/actor-summary-tab';
import { ThreatActorPdfDocument } from './threat-actor-pdf-document';

const TABS = [
    { id: 'summary', label: 'Actor Overview', icon: Globe2 },
    { id: 'cyber', label: 'Cyber', icon: Cpu },
    { id: 'info', label: 'Info-Ops', icon: Brain },
    { id: 'hybrid', label: 'Hybrid Graph', icon: Activity },
] as const;

interface ThreatActorDetailPageProps {
    id: string;
}

export function ThreatActorDetailPage({ id }: ThreatActorDetailPageProps) {
    const [activeTab, setActiveTab] = useDetailTab(TABS);
    const { data, isLoading, isError } = useThreatActorDetail(id);
    const { backPath } = useDetailNavigationContext('/threat-actors');
    useEntityPageTitle(data?.entity?.name);

    async function handleExportPdf() {
        if (!data) return;
        await downloadPdf(
            <ThreatActorPdfDocument detail={data} />,
            toFilename(data.entity.name, '.pdf'),
        );
    }

    function handleExportJson() {
        if (!data) return;
        const { entity, relatedObjects, sightings } = data;
        const bundle = buildStixBundle([
            {
                type: 'threat-actor',
                spec_version: '2.1',
                id: entity.id,
                name: entity.name,
                description: entity.description ?? undefined,
                threat_actor_types:
                    entity.threatActorTypes.length > 0
                        ? entity.threatActorTypes
                        : undefined,
                aliases: entity.aliases.length > 0 ? entity.aliases : undefined,
                first_seen: entity.firstSeen ?? undefined,
                last_seen: entity.lastSeen ?? undefined,
                roles: entity.roles.length > 0 ? entity.roles : undefined,
                goals: entity.goals ?? undefined,
                sophistication: entity.sophistication ?? undefined,
                resource_level: entity.resourceLevel ?? undefined,
                primary_motivations:
                    entity.primaryMotivations.length > 0
                        ? entity.primaryMotivations
                        : undefined,
                secondary_motivations:
                    entity.secondaryMotivations.length > 0
                        ? entity.secondaryMotivations
                        : undefined,
                personal_motivations: entity.personalMotivations ?? undefined,
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
        return <DetailLoadingState message="Loading threat actor…" />;
    }

    if (isError || !data) {
        return (
            <DetailErrorState
                message="Failed to load the requested threat actor."
                backPath={backPath}
                backLabel="Back to registry"
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
                entityTypeLabel="THREAT ACTOR"
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
                    ariaLabel="Threat actor detail tabs"
                />

                {/* ── Tab content ─────────────────────────────── */}
                <div className="pb-12">
                    {activeTab === 'summary' && (
                        <ActorSummaryTab detail={data} />
                    )}
                    {activeTab === 'cyber' && <ActorCyberTab detail={data} />}
                    {activeTab === 'info' && <ActorInfoTab detail={data} />}
                    {activeTab === 'hybrid' && <ActorHybridTab detail={data} />}
                </div>
            </div>
        </div>
    );
}
