'use client';

import '@xyflow/react/dist/style.css';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDateTime, getStixConfig, getStixType } from '@/shared/lib/stix';
import type { EntityBase, EntityDetail } from '@/shared/types/entity';
import {
    Background,
    BackgroundVariant,
    Controls,
    Handle,
    MiniMap,
    Position,
    ReactFlow,
    type Edge,
    type Node,
    type NodeProps,
} from '@xyflow/react';
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
} & Record<string, unknown>;

// ── Custom STIX node ───────────────────────────────────────────────────

function StixNode({ data, selected }: NodeProps) {
    const d = data as StixNodeData;
    const size = d.isCenter ? 72 : 52;

    return (
        <div
            className="flex flex-col items-center"
            style={{ width: size + 48 }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    opacity: 0,
                    pointerEvents: 'none',
                    width: 0,
                    height: 0,
                }}
                isConnectable={false}
            />
            <div
                className={cn(
                    'flex items-center justify-center rounded-full font-bold text-white transition-all duration-200',
                    selected && 'ring-4 ring-offset-2',
                )}
                style={{
                    width: size,
                    height: size,
                    backgroundColor: d.color,
                    boxShadow: selected
                        ? `0 0 0 4px ${d.color}40`
                        : '0 2px 8px rgba(0,0,0,0.12)',
                    fontSize: d.isCenter ? 12 : 9,
                }}
            >
                {d.abbr}
            </div>
            <p
                className="text-foreground/70 mt-2 max-w-29 truncate text-center font-medium"
                style={{ fontSize: 10 }}
            >
                {d.name.length > 16 ? d.name.slice(0, 16) + '\u2026' : d.name}
            </p>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    opacity: 0,
                    pointerEvents: 'none',
                    width: 0,
                    height: 0,
                }}
                isConnectable={false}
            />
        </div>
    );
}

// Must be defined OUTSIDE the component to avoid re-renders
const nodeTypes = { stixNode: StixNode };

// ── Radial layout helpers ──────────────────────────────────────────────

function radialPos(index: number, count: number, r: number) {
    const angle = (index / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
    return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
}

// ── Graph data builders ────────────────────────────────────────────────

type NodeMeta = StixNodeData & { id: string };

function buildGraph<TEntity extends EntityBase>(
    detail: EntityDetail<TEntity>,
): {
    nodes: Node[];
    edges: Edge[];
    meta: NodeMeta[];
} {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const meta: NodeMeta[] = [];

    const { entity, relatedObjects } = detail;
    const entityStixType = getStixType(entity.id);
    const cfg = getStixConfig(entityStixType);

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
    nodes.push({
        id: entity.id,
        type: 'stixNode',
        position: { x: 0, y: 0 },
        data: centerMeta,
        selectable: true,
    });
    meta.push(centerMeta);

    const valid = relatedObjects.filter((r) => r.object !== null);
    const radius = valid.length <= 4 ? 160 : valid.length <= 9 ? 200 : 240;

    valid.forEach(({ object, relationship }, idx) => {
        const obj = object!;
        const type = getStixType(obj.id);
        const config = getStixConfig(type);
        const pos = radialPos(idx, valid.length, radius);

        const nodeMeta: NodeMeta = {
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
        };

        nodes.push({
            id: obj.id,
            type: 'stixNode',
            position: pos,
            data: nodeMeta,
            selectable: true,
        });
        meta.push(nodeMeta);

        edges.push({
            id: `e-${obj.id}`,
            source: entity.id,
            target: obj.id,
            label: relationship.relationshipType,
            type: 'smoothstep',
            style: { strokeWidth: 1.5, stroke: '#d1d5db' },
            labelStyle: { fontSize: 9, fill: '#9ca3af' },
            labelBgStyle: { fill: 'transparent' },
        });
    });

    return { nodes, edges, meta };
}

// ── Component ──────────────────────────────────────────────────────────

interface NetworkGraphTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

export function NetworkGraphTab<TEntity extends EntityBase = EntityBase>({
    detail,
}: NetworkGraphTabProps<TEntity>) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { nodes, edges, meta } = useMemo(() => buildGraph(detail), [detail]);

    // Highlight edges connected to the selected node
    const styledEdges = useMemo<Edge[]>(() => {
        if (!selectedId) return edges;
        const metaMap = new Map(meta.map((m) => [m.id, m]));
        return edges.map((e) => {
            const connected =
                e.source === selectedId || e.target === selectedId;
            const otherId = e.source === selectedId ? e.target : e.source;
            const otherColor = metaMap.get(otherId)?.color ?? '#CF4931';
            return {
                ...e,
                animated: connected,
                style: connected
                    ? { strokeWidth: 2.5, stroke: otherColor }
                    : { strokeWidth: 1, stroke: '#e5e7eb', opacity: 0.5 },
            };
        });
    }, [edges, selectedId, meta]);

    // Sync external selection into React Flow's `selected` prop
    const styledNodes = useMemo<Node[]>(
        () => nodes.map((n) => ({ ...n, selected: n.id === selectedId })),
        [nodes, selectedId],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedId((prev) => (prev === node.id ? null : node.id));
    }, []);

    const onPaneClick = useCallback(() => setSelectedId(null), []);

    const selectedMeta = meta.find((m) => m.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* ── Left entity list ─────────────────────────── */}
            <div className="w-64 shrink-0">
                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="border-b px-4 py-3">
                        <p className="text-foreground/60 text-[0.65rem] font-bold tracking-widest uppercase">
                            Entities ({meta.length})
                        </p>
                    </CardHeader>
                    <ul className="max-h-130 divide-y overflow-y-auto">
                        {meta.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() =>
                                        setSelectedId((prev) =>
                                            prev === item.id ? null : item.id,
                                        )
                                    }
                                    className={cn(
                                        'hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                        selectedId === item.id && 'bg-muted/60',
                                    )}
                                >
                                    <span
                                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-bold text-white"
                                        style={{ backgroundColor: item.color }}
                                    >
                                        {item.abbr}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold">
                                            {item.name.length > 28
                                                ? item.name.slice(0, 28) +
                                                  '\u2026'
                                                : item.name}
                                        </p>
                                        <p className="text-foreground/50 mt-0.5 text-[0.6rem] font-medium tracking-wider uppercase">
                                            {
                                                getStixConfig(item.entityType)
                                                    .label
                                            }
                                        </p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* ── Right: graph + detail panel ──────────────── */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
                {/* React Flow graph */}
                <Card className="overflow-hidden rounded-2xl p-0">
                    <div className="h-120">
                        <ReactFlow
                            nodes={styledNodes}
                            edges={styledEdges}
                            nodeTypes={nodeTypes}
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            nodeOrigin={[0.5, 0.5]}
                            fitView
                            fitViewOptions={{ padding: 0.3 }}
                            minZoom={0.3}
                            maxZoom={2}
                        >
                            <Background
                                variant={BackgroundVariant.Dots}
                                gap={24}
                                size={1}
                                color="#d1d5db"
                            />
                            <Controls showInteractive={false} />
                            <MiniMap
                                nodeColor={(n) =>
                                    ((n.data as StixNodeData)
                                        .color as string) ?? '#888'
                                }
                                maskColor="rgba(255,255,255,0.7)"
                                style={{ borderRadius: 8 }}
                            />
                        </ReactFlow>
                    </div>
                </Card>

                {/* Selected node detail panel */}
                {selectedMeta && (
                    <Card className="rounded-2xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-white"
                                    style={{
                                        backgroundColor: selectedMeta.color,
                                    }}
                                >
                                    {selectedMeta.abbr}
                                </span>
                                <div>
                                    <p className="font-bold">
                                        {selectedMeta.name}
                                    </p>
                                    <p
                                        className="mt-0.5 text-[0.6rem] font-bold tracking-widest uppercase"
                                        style={{ color: selectedMeta.color }}
                                    >
                                        {
                                            getStixConfig(
                                                selectedMeta.entityType,
                                            ).label
                                        }
                                    </p>
                                </div>
                                {selectedMeta.relType && (
                                    <Badge
                                        variant="outline"
                                        className="ml-auto text-[0.65rem]"
                                    >
                                        {selectedMeta.relType}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                                {selectedMeta.createdAt && (
                                    <DetailRow
                                        label="Timestamp"
                                        value={formatDateTime(
                                            selectedMeta.createdAt,
                                        )}
                                    />
                                )}
                                <DetailRow
                                    label="Domain"
                                    value={
                                        getStixConfig(selectedMeta.entityType)
                                            .domain
                                    }
                                />
                                {selectedMeta.source && (
                                    <DetailRow
                                        label="Source"
                                        value={selectedMeta.source}
                                    />
                                )}
                                {selectedMeta.confidence !== undefined && (
                                    <DetailRow
                                        label="Confidence"
                                        value={`${selectedMeta.confidence}%`}
                                    />
                                )}
                            </div>
                            {selectedMeta.description && (
                                <p className="text-foreground/60 mt-3 border-t pt-3 text-xs leading-relaxed">
                                    {selectedMeta.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-foreground/50 text-[0.6rem] font-bold tracking-widest uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-sm font-medium">{value}</p>
        </div>
    );
}
