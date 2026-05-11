'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ConfidenceBar } from '@/shared/components/confidence-bar';
import { getStixConfig, getStixType, type StixDomain } from '@/shared/lib/stix';
import type { EntityBase, EntityDetail } from '@/shared/types/entity';
import {
    AlertCircle,
    FileText,
    GitMerge,
    History,
    Link2,
    Shield,
    Zap,
} from 'lucide-react';
import type React from 'react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

// ── Timeline event type ────────────────────────────────────────────────

interface TimelineEvent {
    id: string;
    timestamp: number;
    domain: StixDomain;
    title: string;
    description?: string;
    source?: string;
    entityType: string;
    color: string;
    confidence?: number;
    /** Shows as a correlation pill */
    correlationLabel?: string;
    /** Shows as a gray entity chip */
    entityLabel?: string;
}

// ── Event builder ──────────────────────────────────────────────────────

function buildEvents<TEntity extends EntityBase>(
    detail: EntityDetail<TEntity>,
): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const { entity, relatedObjects, sightings } = detail;

    const entityStixType = getStixType(entity.id);
    const entityCfg = getStixConfig(entityStixType);
    const entityLabel =
        entityCfg.label !== 'Unknown' ? entityCfg.label : 'Entity';

    events.push({
        id: `${entity.id}--created`,
        timestamp: new Date(entity.createdAt).getTime(),
        domain: 'cognitive',
        title: `${entityLabel} registered`,
        description: entity.description ?? undefined,
        source: entity.createdBy ?? undefined,
        entityType: entityStixType,
        color: entityCfg.color,
        confidence: entity.confidence ?? undefined,
    });

    if (entity.firstSeen) {
        events.push({
            id: `${entity.id}--firstSeen`,
            timestamp: new Date(entity.firstSeen).getTime(),
            domain: 'cyber',
            title: 'First observed',
            entityType: 'observation',
            color: '#0284c7',
        });
    }
    if (entity.lastSeen) {
        events.push({
            id: `${entity.id}--lastSeen`,
            timestamp: new Date(entity.lastSeen).getTime(),
            domain: 'cyber',
            title: 'Last observed',
            entityType: 'observation',
            color: '#0284c7',
        });
    }

    for (const { relationship, object } of relatedObjects) {
        if (!object) continue;
        const type = getStixType(object.id);
        const cfg = getStixConfig(type);
        const ts = relationship.startTime ?? object.createdAt;
        if (!ts) continue;
        const objectName = (object.name as string | undefined) ?? type;
        events.push({
            id: `${relationship.id}--rel`,
            timestamp: new Date(ts).getTime(),
            domain: cfg.domain === 'cyber' ? 'cyber' : 'cognitive',
            title: `${cfg.label} linked: ${objectName}`,
            description: relationship.description,
            source: (
                object.externalReferences as
                    | { sourceName: string }[]
                    | undefined
            )?.[0]?.sourceName,
            entityType: type,
            color: cfg.color,
            confidence: object.confidence,
            entityLabel: objectName,
        });
    }

    for (const sighting of sightings) {
        const ts = sighting.firstSeen ?? sighting.createdAt;
        events.push({
            id: `${sighting.id}--sighting`,
            timestamp: new Date(ts).getTime(),
            domain: 'cyber',
            title: 'Sighting detected',
            description: sighting.description,
            entityType: 'sighting',
            color: getStixConfig('sighting').color,
            correlationLabel: `Sighting #${sighting.id.slice(-6)}`,
        });
    }

    const sorted = events.sort((a, b) => b.timestamp - a.timestamp);

    return sorted;
}

// ── Relative time formatter ────────────────────────────────────────────

function relativeLabel(ts: number): string {
    const now = Date.now();
    const diffMs = now - ts;
    const diffDays = Math.floor(diffMs / 86_400_000);
    const time = new Date(ts).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Yesterday, ${time}`;
    if (diffDays < 30) return `${diffDays} days ago`;
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
}

// ── Entity icon map ────────────────────────────────────────────────────

const ENTITY_ICONS: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    incident: FileText,
    'threat-actor': AlertCircle,
    'intrusion-set': AlertCircle,
    campaign: Zap,
    indicator: Link2,
    sighting: GitMerge,
    'attack-pattern': Shield,
    observation: Shield,
    malware: Shield,
    note: FileText,
};

// ── Dot component ──────────────────────────────────────────────────────

function EventDot({
    event,
    isFirst,
}: {
    event: TimelineEvent;
    isFirst: boolean;
}) {
    const Icon = ENTITY_ICONS[event.entityType] ?? FileText;
    if (isFirst) {
        return (
            <div
                className="border-background relative z-10 size-4 shrink-0 rounded-full border-2 shadow-sm"
                style={{ backgroundColor: event.color }}
            />
        );
    }
    return (
        <div
            className="border-background bg-card relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 shadow-sm"
            style={{ borderColor: event.color }}
        >
            <span style={{ color: event.color }}>
                <Icon className="size-3" />
            </span>
        </div>
    );
}

// ── Single event row ───────────────────────────────────────────────────

function EventRow({
    event,
    isFirst,
    isLast,
    selected,
    onToggle,
}: {
    event: TimelineEvent;
    isFirst: boolean;
    isLast: boolean;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="relative flex gap-4">
            {/* Dot + vertical line */}
            <div className="relative flex w-7 shrink-0 flex-col items-center">
                <div
                    className={cn(
                        'bg-border w-px flex-none',
                        isFirst ? 'invisible h-3' : 'h-3',
                    )}
                />
                <EventDot event={event} isFirst={isFirst} />
                <div
                    className={cn(
                        'bg-border w-px flex-1',
                        isLast && 'invisible',
                    )}
                />
            </div>

            {/* Content */}
            <div
                role="button"
                tabIndex={0}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onToggle();
                }}
                className="min-w-0 flex-1 cursor-pointer pt-0 pb-7"
            >
                {/* Time */}
                <div className="mb-0.5 flex items-center gap-2">
                    <p className="text-foreground/40 text-xs font-medium tracking-wide uppercase">
                        {relativeLabel(event.timestamp)}
                    </p>
                </div>

                {/* Title */}
                <p
                    className="text-sm leading-snug font-bold"
                    style={{
                        color: event.correlationLabel ? event.color : undefined,
                    }}
                >
                    {event.title}
                </p>

                {/* Correlation pill */}
                {event.correlationLabel && (
                    <div className="mt-2">
                        <span
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold"
                            style={{
                                borderColor: `${event.color}55`,
                                backgroundColor: `${event.color}12`,
                                color: event.color,
                            }}
                        >
                            <GitMerge className="size-3" />
                            {event.correlationLabel}
                        </span>
                    </div>
                )}

                {/* Entity chip */}
                {event.entityLabel && !event.correlationLabel && (
                    <div className="mt-1.5">
                        <span className="bg-muted text-foreground/60 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <Shield className="size-3" />
                            {event.entityLabel}
                        </span>
                    </div>
                )}

                {/* Inline confidence — always visible */}
                {event.confidence !== undefined && (
                    <div className="mt-1.5">
                        <ConfidenceBar confidence={event.confidence} />
                    </div>
                )}

                {/* Expanded content */}
                {selected && (
                    <div className="mt-2 space-y-1.5">
                        {event.description && (
                            <p className="text-foreground/60 text-xs leading-relaxed">
                                {event.description}
                            </p>
                        )}
                        {event.source && (
                            <p className="text-foreground/50 text-xs">
                                <span className="font-semibold">Source:</span>{' '}
                                {event.source}
                            </p>
                        )}
                        <span
                            className="inline-flex rounded-full border px-2 py-0.5 text-[0.55rem] font-bold tracking-widest uppercase"
                            style={{
                                borderColor: `${event.color}55`,
                                backgroundColor: `${event.color}12`,
                                color: event.color,
                            }}
                        >
                            {event.domain}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Single-column timeline list ────────────────────────────────────────

function TimelineList({
    events,
    selectedId,
    toggle,
    itemRef,
}: {
    events: TimelineEvent[];
    selectedId: string | null;
    toggle: (id: string) => void;
    itemRef?: (id: string, el: HTMLDivElement | null) => void;
}) {
    return (
        <div>
            {events.map((event, idx) => (
                <div
                    key={event.id}
                    ref={
                        itemRef
                            ? (el) => {
                                  itemRef(event.id, el);
                              }
                            : undefined
                    }
                >
                    <EventRow
                        event={event}
                        isFirst={idx === 0}
                        isLast={idx === events.length - 1}
                        selected={selectedId === event.id}
                        onToggle={() => toggle(event.id)}
                    />
                </div>
            ))}
        </div>
    );
}

// ── Dual-track layout with SVG correlation lines ─────────────────────

function DualTrackTimeline({
    events,
    selectedId,
    toggle,
}: {
    events: TimelineEvent[];
    selectedId: string | null;
    toggle: (id: string) => void;
}) {
    const cyberEvents = useMemo(
        () => events.filter((e) => e.domain === 'cyber'),
        [events],
    );
    const cognitiveEvents = useMemo(
        () => events.filter((e) => e.domain === 'cognitive'),
        [events],
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const svgRef = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const svg = svgRef.current;
        if (!container || !svg) return;

        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const containerRect = container.getBoundingClientRect();
        const WINDOW_MS = 45 * 24 * 60 * 60 * 1000;
        let count = 0;

        for (const ce of cyberEvents) {
            if (count >= 6) break;
            for (const cog of cognitiveEvents) {
                if (Math.abs(ce.timestamp - cog.timestamp) > WINDOW_MS)
                    continue;
                const ceEl = cardRefs.current[ce.id];
                const cogEl = cardRefs.current[cog.id];
                if (!ceEl || !cogEl) continue;
                const ceRect = ceEl.getBoundingClientRect();
                const cogRect = cogEl.getBoundingClientRect();
                const x1 = ceRect.right - containerRect.left;
                const y1 = ceRect.top + ceRect.height / 2 - containerRect.top;
                const x2 = cogRect.left - containerRect.left;
                const y2 = cogRect.top + cogRect.height / 2 - containerRect.top;
                const mx = (x1 + x2) / 2;
                const path = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'path',
                );
                path.setAttribute(
                    'd',
                    `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`,
                );
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'rgba(139, 92, 246, 0.3)');
                path.setAttribute('stroke-width', '1.5');
                path.setAttribute('stroke-dasharray', '5 3');
                svg.appendChild(path);
                count++;
                break;
            }
        }
    }, [events, selectedId, cyberEvents, cognitiveEvents]);

    return (
        <div ref={containerRef} className="relative">
            <svg
                ref={svgRef}
                className="pointer-events-none absolute top-0 left-0 z-10"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                aria-hidden="true"
            />
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full bg-red-500" />
                        <h3 className="text-xs font-bold tracking-widest text-red-600 uppercase">
                            Cyber Domain
                        </h3>
                    </div>
                    <TimelineList
                        events={cyberEvents}
                        selectedId={selectedId}
                        toggle={toggle}
                        itemRef={(id, el) => {
                            cardRefs.current[id] = el;
                        }}
                    />
                </div>
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full bg-violet-500" />
                        <h3 className="text-xs font-bold tracking-widest text-violet-600 uppercase">
                            Cognitive Domain
                        </h3>
                    </div>
                    <TimelineList
                        events={cognitiveEvents}
                        selectedId={selectedId}
                        toggle={toggle}
                        itemRef={(id, el) => {
                            cardRefs.current[id] = el;
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Component ──────────────────────────────────────────────────────────

interface TimelineTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

export function TimelineTab<TEntity extends EntityBase = EntityBase>({
    detail,
}: TimelineTabProps<TEntity>) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showCyber, setShowCyber] = useState(true);
    const [showCognitive, setShowCognitive] = useState(true);
    const events = useMemo(() => buildEvents(detail), [detail]);

    const hasCyber = events.some((e) => e.domain === 'cyber');
    const hasCognitive = events.some((e) => e.domain === 'cognitive');
    const isHybrid = hasCyber && hasCognitive;

    const visibleEvents = useMemo(
        () =>
            events.filter(
                (e) =>
                    (e.domain === 'cyber' && showCyber) ||
                    (e.domain === 'cognitive' && showCognitive),
            ),
        [events, showCyber, showCognitive],
    );

    const visibleHasCyber = visibleEvents.some((e) => e.domain === 'cyber');
    const visibleHasCognitive = visibleEvents.some(
        (e) => e.domain === 'cognitive',
    );
    const visibleIsDual = visibleHasCyber && visibleHasCognitive;

    let timelineTitle = 'Global Timeline';
    if (visibleHasCyber && visibleHasCognitive)
        timelineTitle = 'Dual-Domain Timeline';
    else if (visibleHasCyber) timelineTitle = 'Cyber Timeline';
    else if (visibleHasCognitive) timelineTitle = 'Cognitive Timeline';

    const toggle = (id: string) =>
        setSelectedId((prev) => (prev === id ? null : id));

    return (
        <Card className="isolate gap-0 rounded-2xl py-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5">
                <div className="flex items-center gap-2">
                    <History className="text-primary size-4" />
                    <h2 className="text-foreground/40 text-xs font-bold tracking-widest uppercase">
                        {timelineTitle}
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    {isHybrid && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowCyber((v) => !v)}
                                className={cn(
                                    'flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-bold tracking-widest uppercase transition-all',
                                    showCyber
                                        ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900 dark:bg-red-950/30'
                                        : 'border-border text-foreground/30 hover:text-foreground/50',
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-block size-1.5 rounded-full',
                                        showCyber
                                            ? 'bg-red-500'
                                            : 'bg-foreground/20',
                                    )}
                                />
                                Cyber
                            </button>
                            <button
                                onClick={() => setShowCognitive((v) => !v)}
                                className={cn(
                                    'flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-bold tracking-widest uppercase transition-all',
                                    showCognitive
                                        ? 'border-violet-200 bg-violet-50 text-violet-500 dark:border-violet-900 dark:bg-violet-950/30'
                                        : 'border-border text-foreground/30 hover:text-foreground/50',
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-block size-1.5 rounded-full',
                                        showCognitive
                                            ? 'bg-violet-500'
                                            : 'bg-foreground/20',
                                    )}
                                />
                                Cognitive
                            </button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-6 py-6">
                {visibleEvents.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-foreground/40 text-sm">
                            No timeline events available.
                        </p>
                    </div>
                ) : visibleIsDual ? (
                    <DualTrackTimeline
                        events={visibleEvents}
                        selectedId={selectedId}
                        toggle={toggle}
                    />
                ) : (
                    <TimelineList
                        events={visibleEvents}
                        selectedId={selectedId}
                        toggle={toggle}
                    />
                )}
            </CardContent>
        </Card>
    );
}
