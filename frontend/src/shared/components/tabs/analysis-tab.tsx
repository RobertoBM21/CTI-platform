'use client';

import { Badge } from '@/components/ui/badge';
import { TlpBadge } from '@/shared/components/tlp-badge';
import { formatDate } from '@/shared/lib/stix';
import type {
    EntityBase,
    EntityDetail,
    RelatedReportItem,
    StixObject,
} from '@/shared/types/entity';
import Link from 'next/link';

interface AnalysisTabProps<TEntity extends EntityBase = EntityBase> {
    detail: EntityDetail<TEntity>;
}

function getNotes(
    relatedObjects: EntityDetail['relatedObjects'],
): StixObject[] {
    const seen = new Set<string>();
    const notes: StixObject[] = [];

    for (const item of relatedObjects) {
        const object = item.object;
        if (!object?.id?.startsWith('note--')) continue;
        if (seen.has(object.id)) continue;
        seen.add(object.id);
        notes.push(object);
    }

    return notes;
}

function sortReports(reports: RelatedReportItem[]): RelatedReportItem[] {
    return [...reports].sort((a, b) => {
        const dateA = Date.parse(a.published ?? '');
        const dateB = Date.parse(b.published ?? '');
        return dateB - dateA;
    });
}

export function AnalysisTab<TEntity extends EntityBase = EntityBase>({
    detail,
}: AnalysisTabProps<TEntity>) {
    const reports = sortReports(detail.relatedReports ?? []);
    const notes = getNotes(detail.relatedObjects);

    return (
        <div className="space-y-5">
            <section className="bg-card rounded-xl border p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
                        Related Reports
                    </p>
                    <Badge variant="outline" className="text-xs">
                        {reports.length}
                    </Badge>
                </div>

                {reports.length === 0 ? (
                    <p className="text-foreground/45 text-sm">
                        No reports reference this entity yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="bg-muted/30 rounded-lg border p-3"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {report.name}
                                        </p>
                                        <p className="text-foreground/55 mt-1 text-xs">
                                            Published{' '}
                                            {formatDate(report.published)}
                                            {typeof report.confidence ===
                                                'number' &&
                                                ` · Confidence ${report.confidence}`}
                                        </p>
                                    </div>
                                    <TlpBadge tlp={report.tlp} />
                                </div>

                                <div className="mt-3">
                                    <Link
                                        href={`/reports/${encodeURIComponent(report.id)}`}
                                        className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border px-2.5 text-[0.8rem] font-medium"
                                    >
                                        Open report
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-card rounded-xl border p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
                        Related Notes
                    </p>
                    <Badge variant="outline" className="text-xs">
                        {notes.length}
                    </Badge>
                </div>

                {notes.length === 0 ? (
                    <p className="text-foreground/45 text-sm">
                        No related notes found for this entity.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => {
                            const abstract =
                                typeof note.abstract === 'string'
                                    ? note.abstract
                                    : undefined;
                            const content =
                                typeof note.content === 'string'
                                    ? note.content
                                    : undefined;
                            const preview = content
                                ? content.slice(0, 260)
                                : '';

                            return (
                                <article
                                    key={note.id}
                                    className="bg-muted/30 rounded-lg border p-3"
                                >
                                    <p className="font-semibold">
                                        {abstract ??
                                            note.name ??
                                            'Analyst note'}
                                    </p>
                                    {preview && (
                                        <p className="text-foreground/65 mt-2 text-sm leading-relaxed">
                                            {preview}
                                            {content && content.length > 260
                                                ? '…'
                                                : ''}
                                        </p>
                                    )}
                                    {note.createdAt && (
                                        <p className="text-foreground/45 mt-2 text-xs">
                                            {formatDate(note.createdAt)}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
