'use client';

import { Badge } from '@/components/ui/badge';
import { DetailPageHeader } from '@/shared/components/detail-page-header';
import { DetailTabNav } from '@/shared/components/detail-tab-nav';
import { EntityInfoCard } from '@/shared/components/entity-info-card';
import {
    DetailErrorState,
    DetailLoadingState,
} from '@/shared/components/error-state';
import { ArtifactsTab } from '@/shared/components/tabs/artifacts-tab';
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
import { Activity, Clock, Link2, Wrench } from 'lucide-react';
import { useToolDetail } from '../hooks/use-tool-detail';
import { ToolPdfDocument } from './tool-pdf-document';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Wrench },
    { id: 'network', label: 'Knowledge', icon: Activity },
    { id: 'indicators', label: 'Indicators', icon: Link2 },
    { id: 'timeline', label: 'Audit & Timeline', icon: Clock },
] as const;

interface ToolDetailPageProps {
    id: string;
}

export function ToolDetailPage({ id }: ToolDetailPageProps) {
    const [activeTab, setActiveTab] = useDetailTab(TABS);
    const { data, isLoading, isError } = useToolDetail(id);
    const { backPath } = useDetailNavigationContext('/cyber-domain?tab=tools');
    useEntityPageTitle(data?.entity?.name);

    async function handleExportPdf() {
        if (!data) return;
        await downloadPdf(
            <ToolPdfDocument detail={data} />,
            toFilename(data.entity.name, '.pdf'),
        );
    }

    function handleExportJson() {
        if (!data) return;
        const { entity, relatedObjects, sightings } = data;
        const bundle = buildStixBundle([
            {
                type: 'tool',
                spec_version: '2.1',
                id: entity.id,
                name: entity.name,
                description: entity.description ?? undefined,
                tool_types:
                    entity.toolTypes.length > 0 ? entity.toolTypes : undefined,
                kill_chain_phases:
                    entity.killChainPhases.length > 0
                        ? entity.killChainPhases
                        : undefined,
                tool_version: entity.toolVersion ?? undefined,
                aliases: entity.aliases.length > 0 ? entity.aliases : undefined,
                confidence: entity.confidence ?? undefined,
                revoked: entity.revoked,
                external_references:
                    entity.externalReferences.length > 0
                        ? entity.externalReferences
                        : undefined,
                created: entity.createdAt,
                modified: entity.updatedAt,
            },
            ...buildSroObjects(relatedObjects),
            ...buildRelatedSdos(relatedObjects),
            ...buildSightingObjects(sightings),
        ]);
        downloadJson(bundle, toFilename(entity.name, '.stix.json'));
    }

    if (isLoading) {
        return <DetailLoadingState message="Loading tool…" />;
    }

    if (isError || !data) {
        return (
            <DetailErrorState
                message="Failed to load the requested tool."
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
    const tags = [...attackPatterns];

    return (
        <div className="flex min-h-full flex-col">
            <DetailPageHeader
                entityTypeLabel="TOOL"
                backPath={backPath}
                name={entity.name}
                tlp={entity.tlp as TLP}
                confidence={entity.confidence}
                onExportPdf={handleExportPdf}
                onExportJson={handleExportJson}
            />

            <div className="flex-1 space-y-6 px-6 py-6 lg:px-10">
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
                    ariaLabel="Tool detail tabs"
                />

                <div className="pb-12">
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            {/* Tool types */}
                            {entity.toolTypes.length > 0 && (
                                <div className="bg-card rounded-xl border p-5">
                                    <p className="text-foreground/50 mb-3 text-xs font-bold tracking-widest uppercase">
                                        Tool Types
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {entity.toolTypes.map((t) => (
                                            <Badge key={t} variant="secondary">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Version + Kill-chain */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {entity.toolVersion && (
                                    <div className="bg-card rounded-xl border p-5">
                                        <p className="text-foreground/50 mb-3 text-xs font-bold tracking-widest uppercase">
                                            Version
                                        </p>
                                        <Badge variant="outline">
                                            v{entity.toolVersion}
                                        </Badge>
                                    </div>
                                )}

                                {entity.killChainPhases.length > 0 && (
                                    <div className="bg-card rounded-xl border p-5">
                                        <p className="text-foreground/50 mb-3 text-xs font-bold tracking-widest uppercase">
                                            Kill-chain Phases
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {entity.killChainPhases.map(
                                                (p, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                    >
                                                        {p.phaseName}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'network' && (
                        <NetworkGraphTab detail={data} />
                    )}
                    {activeTab === 'indicators' && (
                        <ArtifactsTab detail={data} />
                    )}
                    {activeTab === 'timeline' && <TimelineTab detail={data} />}
                </div>
            </div>
        </div>
    );
}
