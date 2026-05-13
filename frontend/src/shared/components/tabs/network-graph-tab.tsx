'use client';

import '@xyflow/react/dist/style.css';

import { cn } from '@/lib/utils';
import type { DetailSidePanelNode } from '@/shared/components/detail-side-panel';
import { DetailSidePanel } from '@/shared/components/detail-side-panel';
import { stixTypeIconMap } from '@/shared/components/entity-type-badge';
import { useTheme } from '@/shared/hooks/use-theme';
import { getStixConfig, getStixType } from '@/shared/lib/stix';
import type { EntityBase, EntityDetail } from '@/shared/types/entity';
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
    type SimulationLinkDatum,
    type SimulationNodeDatum,
} from 'd3-force';
import { Database, Maximize2, Minus, Plus } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';

// ── Node data type ─────────────────────────────────────────────────────

type StixNodeData = {
    name: string;
    abbr: string;
    color: string;
    isCenter: boolean;
    entityType: string;
    confidence?: number;
    createdAt?: string;
    description?: string;
    source?: string;
    relType?: string;
    relColor?: string;
} & Record<string, unknown>;

// ── Custom STIX node ───────────────────────────────────────────────────

function StixNode({ data, selected }: NodeProps) {
    const d = data as StixNodeData;
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

// Must be defined OUTSIDE the component to avoid re-renders
const nodeTypes = { stixNode: StixNode };

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

// ── d3-force layout ────────────────────────────────────────────────────

type SimNode = SimulationNodeDatum & { id: string };

function computeLayout(
    nodeIds: string[],
    links: { source: string; target: string }[],
    centerNodeId: string,
): Map<string, { x: number; y: number }> {
    const simNodes: SimNode[] = nodeIds.map((id) => ({
        id,
        x: id === centerNodeId ? 0 : (Math.random() - 0.5) * 300,
        y: id === centerNodeId ? 0 : (Math.random() - 0.5) * 300,
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
                .strength(0.5),
        )
        .force('charge', forceManyBody<SimNode>().strength(-500))
        .force('center', forceCenter(0, 0))
        .force('collide', forceCollide<SimNode>(72))
        .stop();

    sim.tick(300);

    return new Map(simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
}

// ── Graph data builder ─────────────────────────────────────────────────

type NodeMeta = StixNodeData & { id: string };

const MAX_VISIBLE_NODES = 50;

function buildGraph<TEntity extends EntityBase>(
    detail: EntityDetail<TEntity>,
    showAll: boolean,
): {
    nodes: Node[];
    edges: Edge[];
    meta: NodeMeta[];
    hiddenCount: number;
} {
    const { entity, relatedObjects } = detail;
    const entityStixType = getStixType(entity.id);
    const cfg = getStixConfig(entityStixType);

    // Center node meta
    const centerMeta: NodeMeta = {
        id: entity.id,
        name: entity.name,
        abbr: cfg.abbr,
        color: cfg.color,
        isCenter: true,
        entityType: entityStixType,
        confidence: entity.confidence ?? undefined,
        createdAt: entity.createdAt,
        description: entity.description ?? undefined,
        source: entity.createdBy ?? undefined,
    };

    // Deduplicate peripheral nodes by object id
    const nodeMetaMap = new Map<string, NodeMeta>();
    nodeMetaMap.set(entity.id, centerMeta);

    const valid = relatedObjects.filter((r) => r.object !== null);

    for (const { object, relationship } of valid) {
        const obj = object!;
        if (nodeMetaMap.has(obj.id)) continue;
        const type = getStixType(obj.id);
        const config = getStixConfig(type);
        nodeMetaMap.set(obj.id, {
            id: obj.id,
            name: (obj.name as string | undefined) ?? type,
            abbr: config.abbr,
            color: config.color,
            isCenter: false,
            entityType: type,
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

    // Apply node cap (center is always visible)
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

    // Collect edges: correct direction via sourceRef/targetRef, deduplicated
    // Supports both center↔peripheral and peripheral↔peripheral edges
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
        // Only draw edge if both endpoints are in the visible set
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

    // d3-force layout
    const positions = computeLayout(
        [...visibleIds],
        edgeSpecs.map((e) => ({ source: e.source, target: e.target })),
        entity.id,
    );

    // Build ReactFlow nodes (center first)
    const meta: NodeMeta[] = [centerMeta, ...visiblePeripheral];
    const nodes: Node[] = meta.map((m) => ({
        id: m.id,
        type: 'stixNode',
        position: positions.get(m.id) ?? { x: 0, y: 0 },
        data: m,
        selectable: true,
        draggable: false,
    }));

    // Straight edges: center-to-center; opaque circles hide the line inside.
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

    return { nodes, edges, meta, hiddenCount };
}

// ── Edge legend ────────────────────────────────────────────────────────

function EdgeLegend({ activeTypes }: { activeTypes: string[] }) {
    const items = activeTypes
        .slice(0, 8)
        .map((t) => ({ type: t, ...getEdgePalette(t) }));

    if (items.length === 0) return null;

    return (
        <div className="bg-background/95 overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm">
            <div className="border-b px-3 py-2">
                <p className="text-foreground/50 text-[0.6rem] font-bold tracking-widest uppercase">
                    Relationships
                </p>
            </div>
            <div className="flex flex-col divide-y">
                {items.map(({ type, color, dash }) => (
                    <div
                        key={type}
                        className="flex items-center gap-2.5 py-1.5 pr-3 pl-2.5"
                        style={{ borderLeft: `3px solid ${color}` }}
                    >
                        <svg
                            width="20"
                            height="8"
                            className="shrink-0"
                            aria-hidden="true"
                        >
                            <line
                                x1="1"
                                y1="4"
                                x2="19"
                                y2="4"
                                stroke={color}
                                strokeWidth={2}
                                strokeDasharray={dash}
                            />
                        </svg>
                        <span
                            className="text-[0.65rem] font-semibold"
                            style={{ color }}
                        >
                            {type}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Custom controls (pill-shaped) ─────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────

interface NetworkGraphTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

export function NetworkGraphTab<TEntity extends EntityBase = EntityBase>({
    detail,
}: NetworkGraphTabProps<TEntity>) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const {
        nodes: baseNodes,
        edges,
        meta,
        hiddenCount,
    } = useMemo(() => buildGraph(detail, showAll), [detail, showAll]);

    // Highlight edges connected to the selected node
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

    // Overlay selection state
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

    // Derive active relationship types for legend
    const activeTypes = useMemo(() => {
        const types = new Set<string>();
        const visibleIds = new Set(baseNodes.map((n) => n.id));
        for (const { relationship } of detail.relatedObjects) {
            if (
                visibleIds.has(relationship.sourceRef) &&
                visibleIds.has(relationship.targetRef)
            ) {
                types.add(relationship.relationshipType);
            }
        }
        return [...types];
    }, [detail, baseNodes]);

    return (
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
                    {/* Entity list */}
                    <ul className="bg-muted/20 flex-1 overflow-y-auto px-3.5 pt-2 pb-4">
                        {meta.map((item) => {
                            const ItemIcon = stixTypeIconMap[item.entityType];
                            return (
                                <li key={item.id} className="mb-1.5 last:mb-0">
                                    <button
                                        onClick={() =>
                                            setSelectedId((prev) =>
                                                prev === item.id
                                                    ? null
                                                    : item.id,
                                            )
                                        }
                                        className={cn(
                                            'group bg-card flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left shadow-sm transition-all hover:shadow-md',
                                            selectedId === item.id
                                                ? 'ring-primary ring-2 ring-offset-1'
                                                : 'hover:border-primary/30',
                                        )}
                                    >
                                        <span
                                            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: `${item.color}22`,
                                                color: item.color,
                                            }}
                                        >
                                            {ItemIcon ? (
                                                <ItemIcon className="size-3.5" />
                                            ) : (
                                                <span className="text-[0.55rem] font-bold">
                                                    {item.abbr}
                                                </span>
                                            )}
                                        </span>
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
                                                    ? item.name.slice(0, 26) +
                                                      '\u2026'
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
                        <div className="border-t px-4 py-2.5">
                            <button
                                onClick={() => setShowAll(true)}
                                className="text-primary hover:text-primary/80 w-full text-center text-xs font-medium transition-colors"
                            >
                                +{hiddenCount} more — Show all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right: graph ─────────────────────────────── */}
            <div className="min-w-0 flex-1">
                <div className="h-full">
                    <ReactFlow
                        nodes={styledNodes}
                        edges={styledEdges}
                        nodeTypes={nodeTypes}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        nodeOrigin={[0.5, 0.5]}
                        proOptions={{ hideAttribution: true }}
                        fitView
                        fitViewOptions={{ padding: 0.25 }}
                        minZoom={0.3}
                        maxZoom={2.5}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={1}
                            color={isDark ? '#1e3a47' : '#d1d5db'}
                        />
                        <GraphControls />
                        {/* Edge type legend */}
                        <Panel position="bottom-right">
                            <EdgeLegend activeTypes={activeTypes} />
                        </Panel>
                        {/* Selected node detail overlay */}
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
