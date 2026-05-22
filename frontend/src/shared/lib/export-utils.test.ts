import { TLP } from '@/shared/types/enums';
import type { DocumentProps } from '@react-pdf/renderer';
import { waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    buildRelatedSdos,
    buildSightingObjects,
    buildSroObjects,
    buildStixBundle,
    downloadJson,
    downloadPdf,
    toFilename,
    toStixExternalReferences,
    toStixKillChainPhases,
} from './export-utils';

vi.mock('@react-pdf/renderer', () => ({
    pdf: vi.fn(),
}));

import { pdf } from '@react-pdf/renderer';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('export-utils', () => {
    it('builds STIX bundle envelope with random id', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid');

        const result = buildStixBundle([{ id: 'malware--1' }]) as {
            type: string;
            id: string;
            spec_version: string;
            objects: unknown[];
        };

        expect(result.type).toBe('bundle');
        expect(result.id).toBe('bundle--test-uuid');
        expect(result.spec_version).toBe('2.1');
        expect(result.objects).toEqual([{ id: 'malware--1' }]);
    });

    it('maps relationships and sightings to STIX-compatible objects', () => {
        const sroResult = buildSroObjects([
            {
                relationship: {
                    id: 'relationship--1',
                    relationshipType: 'uses',
                    description: 'desc',
                    sourceRef: 'threat-actor--1',
                    targetRef: 'malware--1',
                    startTime: '2024-01-01T00:00:00Z',
                    stopTime: '2024-02-01T00:00:00Z',
                    tlp: TLP.CLEAR,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-02T00:00:00Z',
                },
                object: null,
            },
        ]);

        const sightingResult = buildSightingObjects([
            {
                id: 'sighting--1',
                description: 'seen in telemetry',
                firstSeen: '2024-01-01T00:00:00Z',
                lastSeen: '2024-01-03T00:00:00Z',
                count: 2,
                sightingOfRef: 'indicator--1',
                observedDataRefs: [],
                whereSightedRefs: [],
                tlp: TLP.CLEAR,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            },
        ]);

        expect(sroResult).toEqual([
            {
                type: 'relationship',
                spec_version: '2.1',
                id: 'relationship--1',
                relationship_type: 'uses',
                description: 'desc',
                source_ref: 'threat-actor--1',
                target_ref: 'malware--1',
                start_time: '2024-01-01T00:00:00Z',
                stop_time: '2024-02-01T00:00:00Z',
                created: '2024-01-01T00:00:00Z',
                modified: '2024-01-02T00:00:00Z',
            },
        ]);

        expect(sightingResult).toEqual([
            {
                type: 'sighting',
                spec_version: '2.1',
                id: 'sighting--1',
                description: 'seen in telemetry',
                first_seen: '2024-01-01T00:00:00Z',
                last_seen: '2024-01-03T00:00:00Z',
                count: 2,
                sighting_of_ref: 'indicator--1',
                created: '2024-01-01T00:00:00Z',
                modified: '2024-01-01T00:00:00Z',
            },
        ]);
    });

    it('keeps only non-null related SDOs', () => {
        const result = buildRelatedSdos([
            {
                relationship: {
                    id: 'relationship--1',
                    relationshipType: 'related-to',
                    sourceRef: 'a',
                    targetRef: 'b',
                    tlp: TLP.CLEAR,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                },
                object: null,
            },
            {
                relationship: {
                    id: 'relationship--2',
                    relationshipType: 'related-to',
                    sourceRef: 'a',
                    targetRef: 'c',
                    tlp: TLP.CLEAR,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                },
                object: { id: 'note--1' },
            },
        ]);

        expect(result).toEqual([{ id: 'note--1' }]);
    });

    it('maps external references, kill chain phases and filenames', () => {
        expect(
            toStixExternalReferences([
                {
                    sourceName: 'mitre-attack',
                    externalId: 'T1059',
                    url: 'https://attack.mitre.org/techniques/T1059/',
                },
            ]),
        ).toEqual([
            {
                source_name: 'mitre-attack',
                description: undefined,
                external_id: 'T1059',
                url: 'https://attack.mitre.org/techniques/T1059/',
            },
        ]);

        expect(
            toStixKillChainPhases([
                {
                    killChainName: 'mitre-attack',
                    phaseName: 'execution',
                },
            ]),
        ).toEqual([
            {
                kill_chain_name: 'mitre-attack',
                phase_name: 'execution',
            },
        ]);

        expect(toFilename('Operation Neptune', '.json')).toBe(
            'Operation_Neptune.json',
        );
    });

    it('downloads JSON and PDF payloads through browser APIs', async () => {
        const createObjectUrl = vi
            .spyOn(URL, 'createObjectURL')
            .mockReturnValue('blob:test');
        const revokeObjectUrl = vi
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => {});

        const clickMock = vi.fn();
        const anchor = {
            href: '',
            download: '',
            click: clickMock,
        } as unknown as HTMLAnchorElement;
        vi.spyOn(document, 'createElement').mockReturnValue(anchor);

        downloadJson({ ok: true }, 'bundle.json');

        expect(createObjectUrl).toHaveBeenCalledTimes(1);
        expect(anchor.download).toBe('bundle.json');
        expect(anchor.href).toBe('blob:test');
        expect(clickMock).toHaveBeenCalledTimes(1);
        expect(revokeObjectUrl).toHaveBeenCalledWith('blob:test');

        const toBlob = vi.fn().mockResolvedValue(new Blob(['pdf']));
        vi.mocked(pdf).mockReturnValue({ toBlob } as never);

        await downloadPdf({} as ReactElement<DocumentProps>, 'report.pdf');

        expect(toBlob).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(createObjectUrl).toHaveBeenCalledTimes(2);
        });
        expect(anchor.download).toBe('report.pdf');
        expect(clickMock).toHaveBeenCalledTimes(2);
    });
});
