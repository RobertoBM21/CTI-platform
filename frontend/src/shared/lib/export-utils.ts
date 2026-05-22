import type {
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
} from '@/shared/types/entity';
import type { DocumentProps } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

// ── Download helpers ──────────────────────────────────────────────────────────

/** Renders a @react-pdf/renderer element to a PDF blob and triggers download. */
export async function downloadPdf(
    element: ReactElement<DocumentProps>,
    filename: string,
): Promise<void> {
    const blob = await pdf(element).toBlob();
    triggerDownload(blob, filename);
}

/** Serialises an object to a JSON blob and triggers download. */
export function downloadJson(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });
    triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── STIX bundle builders ──────────────────────────────────────────────────────

/** Builds the outer STIX 2.1 bundle envelope. */
export function buildStixBundle(objects: unknown[]): object {
    return {
        type: 'bundle',
        id: `bundle--${crypto.randomUUID()}`,
        spec_version: '2.1',
        objects,
    };
}

/** Maps relatedObjects to STIX 2.1 relationship SDOs. */
export function buildSroObjects(relatedObjects: RelatedObjectItem[]): object[] {
    return relatedObjects.map(({ relationship }) => ({
        type: 'relationship',
        spec_version: '2.1',
        id: relationship.id,
        relationship_type: relationship.relationshipType,
        description: relationship.description ?? undefined,
        source_ref: relationship.sourceRef,
        target_ref: relationship.targetRef,
        start_time: relationship.startTime ?? undefined,
        stop_time: relationship.stopTime ?? undefined,
        created: relationship.createdAt,
        modified: relationship.updatedAt,
    }));
}

/** Maps sightings to STIX 2.1 sighting SDOs. */
export function buildSightingObjects(sightings: SightingItem[]): object[] {
    return sightings.map((s) => ({
        type: 'sighting',
        spec_version: '2.1',
        id: s.id,
        description: s.description ?? undefined,
        first_seen: s.firstSeen ?? undefined,
        last_seen: s.lastSeen ?? undefined,
        count: s.count,
        sighting_of_ref: s.sightingOfRef,
        created: s.createdAt,
        modified: s.updatedAt,
    }));
}

/** Returns all non-null related objects (the target SDOs). */
export function buildRelatedSdos(
    relatedObjects: RelatedObjectItem[],
): object[] {
    return relatedObjects
        .filter((r) => r.object !== null)
        .map((r) => r.object as object);
}

/** Maps frontend external reference shape to STIX 2.1 external_references. */
export function toStixExternalReferences(refs: StixExternalRef[]): object[] {
    return refs.map((ref) => ({
        source_name: ref.sourceName,
        description: ref.description ?? undefined,
        external_id: ref.externalId ?? undefined,
        url: ref.url ?? undefined,
    }));
}

/** Maps camelCase kill-chain phases to STIX 2.1 kill_chain_phases. */
export function toStixKillChainPhases(
    phases: { killChainName: string; phaseName: string }[],
): object[] {
    return phases.map((phase) => ({
        kill_chain_name: phase.killChainName,
        phase_name: phase.phaseName,
    }));
}

/** Sanitised filename: replaces whitespace with underscores. */
export function toFilename(name: string, suffix: string): string {
    return `${name.replace(/\s+/g, '_')}${suffix}`;
}
