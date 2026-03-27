import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';
import { Incident } from '../../../../../../src/contexts/threat/domain/entities/incident.entity';

describe('Incident', () => {
    describe('constructor with minimal props', () => {
        it('should create an Incident with only the name', () => {
            const incident = new Incident({ name: 'False Ministry Alert' });
            expect(incident.name).toBe('False Ministry Alert');
        });

        it('should generate an id when not provided', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.id).toBeDefined();
            expect(typeof incident.id).toBe('string');
            expect(incident.id.length).toBeGreaterThan(0);
        });

        it('should default TLP to WHITE', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.tlp).toBe(TLP.WHITE);
        });

        it('should default all arrays to empty', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.externalReferences).toEqual([]);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.createdAt).toBeInstanceOf(Date);
            expect(incident.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.description).toBeUndefined();
            expect(incident.firstSeen).toBeUndefined();
            expect(incident.lastSeen).toBeUndefined();
            expect(incident.objective).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();
            const firstSeen = new Date('2025-01-10');
            const lastSeen = new Date('2025-01-12');

            const incident = new Incident({
                id: 'incident-id-789',
                name: 'False Ministry Alert',
                description:
                    'Fabricated alert mimicking government communication',
                firstSeen,
                lastSeen,
                objective: 'Create public panic about energy supply',
                tlp: TLP.AMBER_STRICT,
                confidence: 70,
                revoked: true,
                externalReferences: [
                    { sourceName: 'CERT', externalId: 'INC-789' },
                ],
                createdAt: now,
                updatedAt: now,
            });

            expect(incident.id).toBe('incident-id-789');
            expect(incident.name).toBe('False Ministry Alert');
            expect(incident.description).toBe(
                'Fabricated alert mimicking government communication',
            );
            expect(incident.firstSeen).toBe(firstSeen);
            expect(incident.lastSeen).toBe(lastSeen);
            expect(incident.objective).toBe(
                'Create public panic about energy supply',
            );
            expect(incident.tlp).toBe(TLP.AMBER_STRICT);
            expect(incident.confidence).toBe(70);
            expect(incident.revoked).toBe(true);
            expect(incident.externalReferences).toEqual([
                { sourceName: 'CERT', externalId: 'INC-789' },
            ]);
            expect(incident.createdAt).toBe(now);
            expect(incident.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.revoked).toBe(false);
        });

        it('should default externalReferences to empty array', () => {
            const incident = new Incident({ name: 'Test Incident' });
            expect(incident.externalReferences).toEqual([]);
        });

        it('should accept STIX common props when provided', () => {
            const incident = new Incident({
                name: 'Test Incident',
                confidence: 50,
                revoked: true,
                externalReferences: [
                    { sourceName: 'CERT', externalId: 'INC-001' },
                ],
            });
            expect(incident.confidence).toBe(50);
            expect(incident.revoked).toBe(true);
            expect(incident.externalReferences).toEqual([
                { sourceName: 'CERT', externalId: 'INC-001' },
            ]);
        });
    });
});
