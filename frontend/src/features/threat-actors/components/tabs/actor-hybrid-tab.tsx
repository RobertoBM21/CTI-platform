'use client';

import '@xyflow/react/dist/style.css';

import { cn } from '@/lib/utils';
import type { DetailSidePanelNode } from '@/shared/components/detail-side-panel';
import { DetailSidePanel } from '@/shared/components/detail-side-panel';
import { stixTypeIconMap } from '@/shared/components/entity-type-badge';
import { SectionTitle } from '@/shared/components/section-title';
import { useTheme } from '@/shared/hooks/use-theme';
import { getStixConfig, getStixType } from '@/shared/lib/stix';
import type { StixObject } from '@/shared/types/entity';
import {
    Background,
    BackgroundVariant,
    Handle,
    Panel,
    Position,
    ReactFlow,
    useReactFlow,
    type Edge,
    type Node,
    type NodeProps,
} from '@xyflow/react';
import {
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation,
    forceX,
    forceY,
    type SimulationLinkDatum,
    type SimulationNodeDatum,
} from 'd3-force';
import { Database, Maximize2, Minus, Network, Plus } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { ThreatActorDetail } from '../../types';

// ── Domain classification ──────────────────────────────────────────────

type NodeDomain = 'cyber' | 'info' | 'threat';

const CYBER_TYPES = new Set([
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

const INFO_TYPES = new Set(['note', 'opinion']);

const THREAT_TYPES = new Set([
    'threat-actor',
    'campaign',
    'incident',
    'identity',
    'location',
]);

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

function getDomain(type: string, obj?: StixObject): NodeDomain {
    if (CYBER_TYPES.has(type)) return 'cyber';
    if (INFO_TYPES.has(type)) return 'info';
    if (THREAT_TYPES.has(type)) return 'threat';
    if (type === 'attack-pattern') {
        return obj ? (isCyberTTP(obj) ? 'cyber' : 'info') : 'cyber';
    }
    return 'threat';
}

// Domain → color mapping (overrides STIX type colors)
const DOMAIN_COLORS: Record<NodeDomain, string> = {
    cyber: '#CF4931',
    info: '#7c3aed',
    threat: '#0891b2',
};

const DOMAIN_LEGEND_ENTRIES: {
    label: string;
    domain: NodeDomain;
    description: string;
}[] = [
    {
        label: 'Cyber',
        domain: 'cyber',
        description: 'Malware, tools, exploits',
    },
    { label: 'Info-Ops', domain: 'info', description: 'Narratives, notes' },
    {
        label: 'Threat',
        domain: 'threat',
        description: 'Actors, campaigns, targets',
    },
];

// ── Node data type ─────────────────────────────────────────────────────

type HybridNodeData = {
    name: string;
    abbr: string;
    color: string;
    isCenter: boolean;
    entityType: string;
    domain: NodeDomain;
    confidence?: number;
    createdAt?: string;
    description?: string;
    source?: string;
    relType?: string;
    relColor?: string;
} & Record<string, unknown>;

// ── Custom STIX node ───────────────────────────────────────────────────

function HybridStixNode({ data, selected }: NodeProps) {
    const d = data as HybridNodeData;
    const size = d.isCenter ? 72 : 52;
    const Icon = stixTypeIconMap[d.entityType];
    const iconClass = d.isCenter ? 'size-7' : 'size-5';

    const handleStyle: React.CSSProperties = {
        opacity: 0,
        pointerEvents: 'none',
        width: 1,
        height: 1,
        top: size / 2,
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'auto',
    };

    return (
        <div
            className="flex flex-col items-center"
            style={{ width: size + 48 }}
        >
            <Handle
                type="source"
                position={Position.Top}
                style={handleStyle}
                isConnectable={false}
            />
            <Handle
                type="target"
                position={Position.Top}
                style={handleStyle}
                isConnectable={false}
            />
            <div
                className="flex items-center justify-center rounded-full text-white transition-all duration-200"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: d.color,
                    boxShadow: selected
                        ? `0 0 0 3px ${d.color}, 0 0 0 6px ${d.color}40`
                        : '0 2px 8px rgba(0,0,0,0.15)',
                }}
            >
                {Icon ? (
                    <Icon className={iconClass} />
                ) : (
                    <span
                        style={{
                            fontSize: d.isCenter ? 12 : 9,
                            fontWeight: 'bold',
                        }}
                    >
                        {d.abbr}
                    </span>
                )}
            </div>
            <p
                className="text-foreground/70 mt-2 max-w-29 truncate text-center font-medium"
                style={{ fontSize: 10 }}
            >
                {d.name.length > 16 ? d.name.slice(0, 16) + '\u2026' : d.name}
            </p>
        </div>
    );
}

const nodeTypes = { hybridNode: HybridStixNode };

// ── Edge palette ───────────────────────────────────────────────────────

const EDGE_PALETTE: Record<string, { color: string; dash?: string }> = {
    uses: { color: '#CF4931' },
    indicates: { color: '#7c3aed', dash: '6 3' },
    targets: { color: '#ea580c', dash: '2 4' },
    'attributed-to': { color: '#0891b2' },
    'related-to': { color: '#9ca3af' },
    mitigates: { color: '#16a34a' },
    compromises: { color: '#dc2626', dash: '4 2' },
    delivers: { color: '#d97706' },
    drops: { color: '#b45309', dash: '3 3' },
    exploits: { color: '#c026d3', dash: '6 3' },
};

function getEdgePalette(relType: string) {
    return EDGE_PALETTE[relType] ?? { color: '#9ca3af' };
}

// ── d3-force layout with domain separation ─────────────────────────────

type SimNode = SimulationNodeDatum & { id: string; domain: NodeDomain };

function computeHybridLayout(
    nodeInfos: { id: string; domain: NodeDomain }[],
    links: { source: string; target: string }[],
    centerNodeId: string,
): Map<string, { x: number; y: number }> {
    const X_OFFSET = 280;

    const domainTargetX: Record<NodeDomain, number> = {
        cyber: -X_OFFSET,
        info: X_OFFSET,
        threat: 0,
    };

    const simNodes: SimNode[] = nodeInfos.map(({ id, domain }) => ({
        id,
        domain,
        x:
            id === centerNodeId
                ? 0
                : domainTargetX[domain] + (Math.random() - 0.5) * 100,
        y: id === centerNodeId ? 0 : (Math.random() - 0.5) * 200,
        fx: id === centerNodeId ? 0 : undefined,
        fy: id === centerNodeId ? 0 : undefined,
    }));

    const sim = forceSimulation<SimNode>(simNodes)
        .force(
            'link',
            forceLink<SimNode, SimulationLinkDatum<SimNode>>(
                links.map((l) => ({ source: l.source, target: l.target })),
            )
                .id((d) => d.id)
                .distance(170)
                .strength(0.3),
        )
        .force('charge', forceManyBody<SimNode>().strength(-400))
        .force('center', forceCenter(0, 0).strength(0.05))
        .force('collide', forceCollide<SimNode>(72))
        .force(
            'domainX',
            forceX<SimNode>((d) =>
                d.id === centerNodeId ? 0 : domainTargetX[d.domain],
            ).strength(0.6),
        )
        .force('domainY', forceY<SimNode>(0).strength(0.05))
        .stop();

    sim.tick(400);

    return new Map(simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
}

// ── Graph data builder ─────────────────────────────────────────────────

type NodeMeta = HybridNodeData & { id: string };

const MAX_VISIBLE_NODES = 20;

function buildHybridGraph(
    detail: ThreatActorDetail,
    showAll: boolean,
): {
    nodes: Node[];
    edges: Edge[];
    meta: NodeMeta[];
    hiddenCount: number;
    activeRelTypes: string[];
} {
    const { entity, relatedObjects } = detail;
    const entityStixType = getStixType(entity.id);
    const cfg = getStixConfig(entityStixType);
    const centerDomain: NodeDomain = 'threat';

    const centerMeta: NodeMeta = {
        id: entity.id,
        name: entity.name,
        abbr: cfg.abbr,
        color: DOMAIN_COLORS[centerDomain],
        isCenter: true,
        entityType: entityStixType,
        domain: centerDomain,
        confidence: entity.confidence ?? undefined,
        createdAt: entity.createdAt,
        description: entity.description ?? undefined,
        source: entity.createdBy ?? undefined,
    };

    const nodeMetaMap = new Map<string, NodeMeta>();
    nodeMetaMap.set(entity.id, centerMeta);

    const valid = relatedObjects.filter((r) => r.object !== null);

    for (const { object, relationship } of valid) {
        const obj = object!;
        if (nodeMetaMap.has(obj.id)) continue;
        const type = getStixType(obj.id);
        const stixCfg = getStixConfig(type);
        const domain = getDomain(type, obj);
        nodeMetaMap.set(obj.id, {
            id: obj.id,
            name: (obj.name as string | undefined) ?? type,
            abbr: stixCfg.abbr,
            color: DOMAIN_COLORS[domain],
            isCenter: false,
            entityType: type,
            domain,
            confidence: obj.confidence,
            createdAt: obj.createdAt,
            description: obj.description as string | undefined,
            source: (
                obj.externalReferences as { sourceName: string }[] | undefined
            )?.[0]?.sourceName,
            relType: relationship.relationshipType,
            relColor: getEdgePalette(relationship.relationshipType).color,
        });
    }

    const allPeripheral = [...nodeMetaMap.values()].filter((m) => !m.isCenter);
    const hiddenCount = showAll
        ? 0
        : Math.max(0, allPeripheral.length - MAX_VISIBLE_NODES);
    const visiblePeripheral = showAll
        ? allPeripheral
        : allPeripheral.slice(0, MAX_VISIBLE_NODES);
    const visibleIds = new Set([
        entity.id,
        ...visiblePeripheral.map((m) => m.id),
    ]);

    const edgeSpecs: {
        id: string;
        source: string;
        target: string;
        relType: string;
    }[] = [];
    const seenEdgeIds = new Set<string>();

    for (const { relationship } of valid) {
        if (seenEdgeIds.has(relationship.id)) continue;
        seenEdgeIds.add(relationship.id);
        if (
            visibleIds.has(relationship.sourceRef) &&
            visibleIds.has(relationship.targetRef)
        ) {
            edgeSpecs.push({
                id: relationship.id,
                source: relationship.sourceRef,
                target: relationship.targetRef,
                relType: relationship.relationshipType,
            });
        }
    }

    const nodeInfosForLayout = [...visibleIds].map((id) => ({
        id,
        domain: (nodeMetaMap.get(id)?.domain ?? 'threat') as NodeDomain,
    }));

    const positions = computeHybridLayout(
        nodeInfosForLayout,
        edgeSpecs.map((e) => ({ source: e.source, target: e.target })),
        entity.id,
    );

    const meta: NodeMeta[] = [centerMeta, ...visiblePeripheral];
    const nodes: Node[] = meta.map((m) => ({
        id: m.id,
        type: 'hybridNode',
        position: positions.get(m.id) ?? { x: 0, y: 0 },
        data: m,
        selectable: true,
        draggable: false,
    }));

    const edges: Edge[] = edgeSpecs.map(({ id, source, target, relType }) => {
        const palette = getEdgePalette(relType);
        return {
            id,
            source,
            target,
            type: 'straight',
            style: {
                strokeWidth: 1.5,
                stroke: palette.color,
                strokeDasharray: palette.dash,
            },
        };
    });

    const activeRelTypes = [...new Set(edgeSpecs.map((e) => e.relType))];

    return { nodes, edges, meta, hiddenCount, activeRelTypes };
}

// ── Combined Domain / Relationships legend ─────────────────────────────

function HybridLegend({ activeRelTypes }: { activeRelTypes: string[] }) {
    const [view, setView] = useState<'domain' | 'relationships'>('domain');

    return (
        <div className="bg-background/95 min-w-44 overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm">
            {/* Toggle tabs */}
            <div className="grid grid-cols-2 border-b">
                <button
                    onClick={() => setView('domain')}
                    className={cn(
                        'py-1.5 text-[0.6rem] font-bold tracking-widest uppercase transition-colors',
                        view === 'domain'
                            ? 'text-foreground border-primary border-b-2'
                            : 'text-foreground/40 hover:text-foreground/70',
                    )}
                >
                    Domain
                </button>
                <button
                    onClick={() => setView('relationships')}
                    className={cn(
                        'py-1.5 text-[0.6rem] font-bold tracking-widest uppercase transition-colors',
                        view === 'relationships'
                            ? 'text-foreground border-primary border-b-2'
                            : 'text-foreground/40 hover:text-foreground/70',
                    )}
                >
                    Relations
                </button>
            </div>

            {/* Domain view */}
            {view === 'domain' && (
                <div className="flex flex-col divide-y">
                    {DOMAIN_LEGEND_ENTRIES.map(
                        ({ label, domain, description }) => (
                            <div
                                key={domain}
                                className="flex items-center gap-2.5 py-2 pr-3 pl-2.5"
                                style={{
                                    borderLeft: `3px solid ${DOMAIN_COLORS[domain]}`,
                                }}
                            >
                                <div
                                    className="size-3 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: DOMAIN_COLORS[domain],
                                    }}
                                />
                                <div>
                                    <p
                                        className="text-[0.65rem] font-semibold"
                                        style={{ color: DOMAIN_COLORS[domain] }}
                                    >
                                        {label}
                                    </p>
                                    <p className="text-foreground/40 text-[0.55rem]">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}

            {/* Relationships view */}
            {view === 'relationships' && (
                <div className="flex flex-col divide-y">
                    {activeRelTypes.length === 0 ? (
                        <p className="text-foreground/40 px-3 py-3 text-[0.6rem]">
                            No relationships
                        </p>
                    ) : (
                        activeRelTypes.map((relType) => {
                            const palette = getEdgePalette(relType);
                            return (
                                <div
                                    key={relType}
                                    className="flex items-center gap-2.5 py-2 pr-3 pl-2.5"
                                    style={{
                                        borderLeft: `3px solid ${palette.color}`,
                                    }}
                                >
                                    <svg
                                        width="28"
                                        height="8"
                                        className="shrink-0"
                                    >
                                        <line
                                            x1="0"
                                            y1="4"
                                            x2="28"
                                            y2="4"
                                            stroke={palette.color}
                                            strokeWidth="1.5"
                                            strokeDasharray={
                                                palette.dash ?? 'none'
                                            }
                                        />
                                    </svg>
                                    <p
                                        className="text-[0.6rem] font-semibold capitalize"
                                        style={{ color: palette.color }}
                                    >
                                        {relType}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

// ── Graph controls ─────────────────────────────────────────────────────

function GraphControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    return (
        <Panel position="top-right">
            <div className="bg-background/95 flex items-center gap-0.5 rounded-full border px-2 py-1.5 shadow-md backdrop-blur-sm">
                <button
                    onClick={() => zoomIn({ duration: 200 })}
                    className="text-foreground/60 hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
                    title="Zoom in"
                >
                    <Plus className="size-3.5" />
                </button>
                <button
                    onClick={() => zoomOut({ duration: 200 })}
                    className="text-foreground/60 hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
                    title="Zoom out"
                >
                    <Minus className="size-3.5" />
                </button>
                <div className="bg-border mx-0.5 h-3.5 w-px" />
                <button
                    onClick={() => fitView({ duration: 200, padding: 0.25 })}
                    className="text-foreground/60 hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
                    title="Fit view"
                >
                    <Maximize2 className="size-3.5" />
                </button>
            </div>
        </Panel>
    );
}

// ── Main component ─────────────────────────────────────────────────────

interface ActorHybridTabProps {
    detail: ThreatActorDetail;
}

export function ActorHybridTab({ detail }: ActorHybridTabProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const {
        nodes: baseNodes,
        edges,
        meta,
        hiddenCount,
        activeRelTypes,
    } = useMemo(() => buildHybridGraph(detail, showAll), [detail, showAll]);

    const styledEdges = useMemo<Edge[]>(() => {
        if (!selectedId) return edges;
        return edges.map((e) => {
            const connected =
                e.source === selectedId || e.target === selectedId;
            return {
                ...e,
                animated: connected,
                style: connected
                    ? { ...(e.style as object), strokeWidth: 2.5 }
                    : { ...(e.style as object), opacity: 0.3 },
            };
        });
    }, [edges, selectedId]);

    const styledNodes = useMemo<Node[]>(
        () => baseNodes.map((n) => ({ ...n, selected: n.id === selectedId })),
        [baseNodes, selectedId],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedId((prev) => (prev === node.id ? null : node.id));
    }, []);

    const onPaneClick = useCallback(() => setSelectedId(null), []);

    const selectedMeta: DetailSidePanelNode | null =
        meta.find((m) => m.id === selectedId) ?? null;

    return (
        <div className="space-y-4">
            <SectionTitle icon={Network} title="Hybrid Domain Graph" />
            <div className="bg-card ring-foreground/10 flex h-140 overflow-hidden rounded-2xl shadow-sm ring-1">
                {/* ── Left entity list ─────────────────────────── */}
                <div className="flex w-68 shrink-0 flex-col border-r">
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex items-center gap-2 border-b px-5 py-4">
                            <Database className="text-primary size-4 shrink-0" />
                            <p className="text-foreground/60 text-xs font-bold tracking-widest uppercase">
                                Entities ({meta.length}
                                {hiddenCount > 0 ? `+${hiddenCount}` : ''})
                            </p>
                        </div>
                        <ul className="bg-muted/20 flex-1 overflow-y-auto px-3.5 pt-2 pb-4">
                            {meta.map((item) => {
                                const ItemIcon =
                                    stixTypeIconMap[item.entityType];
                                return (
                                    <li
                                        key={item.id}
                                        className="mb-1.5 last:mb-0"
                                    >
                                        <button
                                            onClick={() =>
                                                setSelectedId((prev) =>
                                                    prev === item.id
                                                        ? null
                                                        : item.id,
                                                )
                                            }
                                            className={cn(
                                                'group bg-card flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left shadow-sm transition-all hover:shadow-md',
                                                selectedId === item.id
                                                    ? 'ring-primary ring-2 ring-offset-1'
                                                    : 'hover:border-primary/30',
                                            )}
                                        >
                                            <div
                                                className="flex size-7 shrink-0 items-center justify-center rounded-full text-white"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            >
                                                {ItemIcon ? (
                                                    <ItemIcon className="size-3.5" />
                                                ) : (
                                                    <span className="text-[8px] font-bold">
                                                        {item.abbr}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p
                                                    className={cn(
                                                        'truncate text-xs leading-tight font-semibold transition-colors',
                                                        selectedId === item.id
                                                            ? 'text-primary'
                                                            : 'group-hover:text-primary',
                                                    )}
                                                >
                                                    {item.name.length > 26
                                                        ? item.name.slice(
                                                              0,
                                                              26,
                                                          ) + '\u2026'
                                                        : item.name}
                                                </p>
                                                <p className="text-foreground/50 mt-0.5 text-[0.6rem] font-semibold tracking-wider uppercase">
                                                    {
                                                        getStixConfig(
                                                            item.entityType,
                                                        ).label
                                                    }
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        {hiddenCount > 0 && (
                            <div className="border-t p-3">
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="text-primary hover:bg-primary/8 w-full rounded-xl py-2 text-xs font-semibold transition-colors"
                                >
                                    +{hiddenCount} more — Show all
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Graph canvas ─────────────────────────────── */}
                <div className="relative flex-1">
                    <ReactFlow
                        nodes={styledNodes}
                        edges={styledEdges}
                        nodeTypes={nodeTypes}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        fitView
                        fitViewOptions={{ padding: 0.3 }}
                        minZoom={0.2}
                        maxZoom={2}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable
                        colorMode={isDark ? 'dark' : 'light'}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={20}
                            size={1}
                            color={isDark ? '#334155' : '#d1d5db'}
                        />
                        <GraphControls />
                        <Panel position="bottom-right">
                            <HybridLegend activeRelTypes={activeRelTypes} />
                        </Panel>
                        {selectedMeta && (
                            <Panel position="top-left">
                                <DetailSidePanel
                                    node={selectedMeta}
                                    onClose={() => setSelectedId(null)}
                                />
                            </Panel>
                        )}
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
