import { Location } from '../../../../../../src/contexts/cyber/domain/entities/location.entity';
import { Region } from '../../../../../../src/contexts/cyber/domain/value-objects/region.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Location', () => {
    describe('constructor with minimal props', () => {
        it('should create a Location with only the name', () => {
            const loc = new Location({ name: 'Madrid' });
            expect(loc.name).toBe('Madrid');
        });

        it('should generate an id when not provided', () => {
            const loc = new Location({ name: 'Test' });
            expect(loc.id).toBeDefined();
            expect(typeof loc.id).toBe('string');
        });

        it('should default TLP to WHITE', () => {
            const loc = new Location({ name: 'Test' });
            expect(loc.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const loc = new Location({ name: 'Test' });
            expect(loc.externalReferences).toEqual([]);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const loc = new Location({ name: 'Test' });
            expect(loc.latitude).toBeUndefined();
            expect(loc.longitude).toBeUndefined();
            expect(loc.country).toBeUndefined();
            expect(loc.region).toBeUndefined();
            expect(loc.administrativeArea).toBeUndefined();
            expect(loc.city).toBeUndefined();
            expect(loc.postalCode).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const loc = new Location({
                id: 'loc-id-1',
                name: 'Madrid',
                description: 'Capital of Spain',
                latitude: 40.4168,
                longitude: -3.7038,
                country: 'ES',
                region: Region.SOUTHERN_EUROPE,
                administrativeArea: 'Comunidad de Madrid',
                city: 'Madrid',
                postalCode: '28001',
                confidence: 95,
                revoked: false,
                externalReferences: [
                    { sourceName: 'GeoNames', externalId: '3117735' },
                ],
                tlp: TLP.GREEN,
                createdAt: now,
                updatedAt: now,
            });

            expect(loc.id).toBe('loc-id-1');
            expect(loc.name).toBe('Madrid');
            expect(loc.latitude).toBe(40.4168);
            expect(loc.longitude).toBe(-3.7038);
            expect(loc.country).toBe('ES');
            expect(loc.region).toBe(Region.SOUTHERN_EUROPE);
            expect(loc.administrativeArea).toBe('Comunidad de Madrid');
            expect(loc.city).toBe('Madrid');
            expect(loc.postalCode).toBe('28001');
            expect(loc.confidence).toBe(95);
            expect(loc.revoked).toBe(false);
            expect(loc.externalReferences).toEqual([
                { sourceName: 'GeoNames', externalId: '3117735' },
            ]);
            expect(loc.tlp).toBe(TLP.GREEN);
            expect(loc.createdAt).toBe(now);
            expect(loc.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const loc = new Location({ name: 'Test' });
            expect(loc.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const loc = new Location({ name: 'Test' });
            expect(loc.revoked).toBe(false);
        });
    });
});
