'use client';

import { usePageTitle } from '@/providers/page-title-context';
import { DetailPageHeader } from '@/shared/components/detail-page-header';
import { EntityInfoCard } from '@/shared/components/entity-info-card';
import {
    DetailErrorState,
    DetailLoadingState,
} from '@/shared/components/error-state';
import { getStixType } from '@/shared/lib/stix';
import { TLP } from '@/shared/types/enums';
import { Activity, Brain, Cpu, Globe2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useThreatActorDetail } from '../hooks/use-threat-actor-detail';
import { ActorCyberTab } from './tabs/actor-cyber-tab';
import { ActorHybridTab } from './tabs/actor-hybrid-tab';
import { ActorInfoTab } from './tabs/actor-info-tab';
import { ActorSummaryTab } from './tabs/actor-summary-tab';

const TABS = [
    { id: 'summary', label: 'Actor Overview', icon: Globe2 },
    { id: 'cyber', label: 'Cyber', icon: Cpu },
    { id: 'info', label: 'Info-Ops', icon: Brain },
    { id: 'hybrid', label: 'Hybrid Graph', icon: Activity },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface ThreatActorDetailPageProps {
    id: string;
}

export function ThreatActorDetailPage({ id }: ThreatActorDetailPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawTab = searchParams.get('tab');
    const activeTab: TabId = TABS.some((t) => t.id === rawTab)
        ? (rawTab as TabId)
        : 'summary';

    function setActiveTab(tab: TabId) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    }

    const { data, isLoading, isError } = useThreatActorDetail(id);
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        if (data?.entity?.name) {
            setPageTitle(data.entity.name);
        }
        return () => setPageTitle('');
    }, [data?.entity?.name, setPageTitle]);

    if (isLoading) {
        return <DetailLoadingState message="Loading threat actor…" />;
    }

    if (isError || !data) {
        return (
            <DetailErrorState
                message="Failed to load the requested threat actor."
                backPath="/threat-actors"
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
                backPath="/threat-actors"
                name={entity.name}
                tlp={entity.tlp as TLP}
                confidence={entity.confidence}
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

                {/* ── Tab navigation ──────────────────────────── */}
                <div className="border-b">
                    <nav
                        className="-mb-px flex gap-1 overflow-x-auto"
                        aria-label="Threat actor detail tabs"
                    >
                        {TABS.map(({ id: tabId, label, icon: Icon }) => (
                            <button
                                key={tabId}
                                onClick={() => setActiveTab(tabId)}
                                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tabId
                                        ? 'border-primary text-primary'
                                        : 'text-foreground/50 hover:border-foreground/20 hover:text-foreground/80 border-transparent'
                                }`}
                                aria-current={
                                    activeTab === tabId ? 'true' : undefined
                                }
                            >
                                <Icon className="size-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

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
