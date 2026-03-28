import { Sighting } from '../../../../../../src/contexts/shared/domain/entities/sighting.entity';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Sighting', () => {
    describe('constructor with minimal props', () => {
        it('should create a Sighting with only sightingOfRef', () => {
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            expect(sighting.sightingOfRef).toBe(
                'indicator--malicious-ip-blocklist',
            );
        });

        it('should generate an id when not provided', () => {
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            expect(sighting.id).toMatch(/^sighting--/);
        });

        it('should default TLP to WHITE', () => {
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            expect(sighting.tlp).toBe(TLP.WHITE);
        });

        it('should default count to 1', () => {
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            expect(sighting.count).toBe(1);
        });

        it('should default arrays to empty', () => {
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            expect(sighting.observedDataRefs).toEqual([]);
            expect(sighting.whereSightedRefs).toEqual([]);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const before = new Date();
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            const after = new Date();
            expect(sighting.createdAt).toBeInstanceOf(Date);
            expect(sighting.updatedAt).toBeInstanceOf(Date);
            expect(sighting.createdAt.getTime()).toBeGreaterThanOrEqual(
                before.getTime(),
            );
            expect(sighting.updatedAt.getTime()).toBeLessThanOrEqual(
                after.getTime(),
            );
        });

        it('should leave optional fields as undefined when not provided', () => {
            const sighting = new Sighting({
                sightingOfRef: 'indicator--malicious-ip-blocklist',
            });
            expect(sighting.description).toBeUndefined();
            expect(sighting.firstSeen).toBeUndefined();
            expect(sighting.lastSeen).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const id = 'sighting--sighting-id-001';
            const firstSeen = new Date('2025-03-01');
            const lastSeen = new Date('2025-03-15');
            const now = new Date();
            const sighting = new Sighting({
                id,
                description:
                    'Cobalt Strike C2 beacon detected in SCADA network segment',
                firstSeen,
                lastSeen,
                count: 5,
                sightingOfRef: 'indicator--cobalt-strike-c2-beacon',
                observedDataRefs: [
                    'observed-data--pcap-20250301',
                    'observed-data--siem-alert-42',
                ],
                whereSightedRefs: ['identity--energy-sector-soc'],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(sighting.id).toBe(id);
            expect(sighting.description).toBe(
                'Cobalt Strike C2 beacon detected in SCADA network segment',
            );
            expect(sighting.firstSeen).toBe(firstSeen);
            expect(sighting.lastSeen).toBe(lastSeen);
            expect(sighting.count).toBe(5);
            expect(sighting.sightingOfRef).toBe(
                'indicator--cobalt-strike-c2-beacon',
            );
            expect(sighting.observedDataRefs).toEqual([
                'observed-data--pcap-20250301',
                'observed-data--siem-alert-42',
            ]);
            expect(sighting.whereSightedRefs).toEqual([
                'identity--energy-sector-soc',
            ]);
            expect(sighting.tlp).toBe(TLP.AMBER);
            expect(sighting.createdAt).toBe(now);
            expect(sighting.updatedAt).toBe(now);
        });
    });
});
