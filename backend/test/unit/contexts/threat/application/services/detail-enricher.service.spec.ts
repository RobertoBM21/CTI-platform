import { ReportService } from '../../../../../../src/contexts/reporting/application/services/report.service';
import { RelationshipService } from '../../../../../../src/contexts/shared/application/services/relationship.service';
import { SightingService } from '../../../../../../src/contexts/shared/application/services/sighting.service';
import { Relationship } from '../../../../../../src/contexts/shared/domain/entities/relationship.entity';
import { Sighting } from '../../../../../../src/contexts/shared/domain/entities/sighting.entity';
import { RelationshipType } from '../../../../../../src/contexts/shared/domain/value-objects/relationship-type.vo';
import { DetailEnricher } from '../../../../../../src/contexts/threat/application/services/detail-enricher.service';
import { StixRefResolver } from '../../../../../../src/contexts/threat/application/services/stix-ref-resolver.service';

describe('DetailEnricher', () => {
    function createEnricher(
        sourceRels: Relationship[] = [],
        targetRels: Relationship[] = [],
        sightings: Sighting[] = [],
        resolvedObject: unknown = null,
        relatedReports: unknown[] = [],
    ) {
        const relationshipService: Pick<
            RelationshipService,
            'findBySourceRef' | 'findByTargetRef'
        > = {
            findBySourceRef: jest.fn().mockResolvedValue(sourceRels),
            findByTargetRef: jest.fn().mockResolvedValue(targetRels),
        };
        const sightingService: Pick<SightingService, 'findBySightingOfRef'> = {
            findBySightingOfRef: jest.fn().mockResolvedValue(sightings),
        };
        const stixRefResolver: Pick<StixRefResolver, 'resolve'> = {
            resolve: jest.fn().mockResolvedValue(resolvedObject),
        };
        const reportService: Pick<ReportService, 'findByObjectRef'> = {
            findByObjectRef: jest.fn().mockResolvedValue(relatedReports),
        };

        return {
            enricher: new DetailEnricher(
                relationshipService as RelationshipService,
                sightingService as SightingService,
                stixRefResolver as StixRefResolver,
                reportService as ReportService,
            ),
            mocks: {
                relationshipService,
                sightingService,
                stixRefResolver,
                reportService,
            },
        };
    }

    it('should return entity with empty relatedObjects and sightings when none exist', async () => {
        const { enricher } = createEnricher();
        const entity = { id: 'threat-actor--ta1', name: 'APT28' };

        const result = await enricher.enrich(entity);

        expect(result.entity).toBe(entity);
        expect(result.relatedObjects).toEqual([]);
        expect(result.sightings).toEqual([]);
        expect(result.relatedReports).toEqual([]);
    });

    it('should resolve related objects from source relationships', async () => {
        const rel = new Relationship({
            id: 'relationship--r1',
            relationshipType: RelationshipType.USES,
            sourceRef: 'threat-actor--ta1',
            targetRef: 'malware--m1',
        });
        const malware = { id: 'malware--m1', name: 'Emotet' };
        const { enricher, mocks } = createEnricher([rel], [], [], malware);
        const entity = { id: 'threat-actor--ta1', name: 'APT28' };

        const result = await enricher.enrich(entity);

        expect(mocks.stixRefResolver.resolve).toHaveBeenCalledWith(
            'malware--m1',
        );
        expect(result.relatedObjects).toHaveLength(1);
        expect(result.relatedObjects[0]?.relationship).toBe(rel);
        expect(result.relatedObjects[0]?.object).toEqual(malware);
    });

    it('should resolve related objects from target relationships', async () => {
        const rel = new Relationship({
            id: 'relationship--r2',
            relationshipType: RelationshipType.ATTRIBUTED_TO,
            sourceRef: 'campaign--c1',
            targetRef: 'threat-actor--ta1',
        });
        const campaign = { id: 'campaign--c1', name: 'Operation X' };
        const { enricher, mocks } = createEnricher([], [rel], [], campaign);
        const entity = { id: 'threat-actor--ta1', name: 'APT28' };

        const result = await enricher.enrich(entity);

        expect(mocks.stixRefResolver.resolve).toHaveBeenCalledWith(
            'campaign--c1',
        );
        expect(result.relatedObjects).toHaveLength(1);
        expect(result.relatedObjects[0]?.object).toEqual(campaign);
    });

    it('should include sightings in the result', async () => {
        const sighting = new Sighting({
            id: 'sighting--s1',
            sightingOfRef: 'threat-actor--ta1',
            count: 5,
        });
        const { enricher } = createEnricher([], [], [sighting]);
        const entity = { id: 'threat-actor--ta1', name: 'APT28' };

        const result = await enricher.enrich(entity);

        expect(result.sightings).toHaveLength(1);
        expect(result.sightings[0]?.id).toBe('sighting--s1');
    });

    it('should set object to null when resolver returns null', async () => {
        const rel = new Relationship({
            id: 'relationship--r3',
            relationshipType: RelationshipType.USES,
            sourceRef: 'threat-actor--ta1',
            targetRef: 'malware--deleted',
        });
        const { enricher } = createEnricher([rel]);
        const entity = { id: 'threat-actor--ta1', name: 'APT28' };

        const result = await enricher.enrich(entity);

        expect(result.relatedObjects[0]?.object).toBeNull();
    });

    it('should include relationships between peripheral nodes', async () => {
        const centerToMalware = new Relationship({
            id: 'relationship--cm',
            relationshipType: RelationshipType.USES,
            sourceRef: 'campaign--c1',
            targetRef: 'malware--m1',
        });
        const centerToActor = new Relationship({
            id: 'relationship--ca',
            relationshipType: RelationshipType.ATTRIBUTED_TO,
            sourceRef: 'campaign--c1',
            targetRef: 'threat-actor--ta1',
        });
        const actorUsesMalware = new Relationship({
            id: 'relationship--am',
            relationshipType: RelationshipType.USES,
            sourceRef: 'threat-actor--ta1',
            targetRef: 'malware--m1',
        });

        const malware = { id: 'malware--m1', name: 'SomeRAT' };
        const actor = { id: 'threat-actor--ta1', name: 'APT1' };

        const relationshipService: Pick<
            RelationshipService,
            'findBySourceRef' | 'findByTargetRef'
        > = {
            findBySourceRef: jest.fn().mockImplementation((id: string) => {
                if (id === 'campaign--c1')
                    return Promise.resolve([centerToMalware, centerToActor]);
                if (id === 'threat-actor--ta1')
                    return Promise.resolve([actorUsesMalware]);
                return Promise.resolve([]);
            }),
            findByTargetRef: jest.fn().mockResolvedValue([]),
        };
        const sightingService: Pick<SightingService, 'findBySightingOfRef'> = {
            findBySightingOfRef: jest.fn().mockResolvedValue([]),
        };
        const stixRefResolver: Pick<StixRefResolver, 'resolve'> = {
            resolve: jest.fn().mockImplementation((id: string) => {
                if (id === 'malware--m1') return Promise.resolve(malware);
                if (id === 'threat-actor--ta1') return Promise.resolve(actor);
                return Promise.resolve(null);
            }),
        };
        const reportService: Pick<ReportService, 'findByObjectRef'> = {
            findByObjectRef: jest.fn().mockResolvedValue([]),
        };

        const enricher = new DetailEnricher(
            relationshipService as RelationshipService,
            sightingService as SightingService,
            stixRefResolver as StixRefResolver,
            reportService as ReportService,
        );
        const entity = { id: 'campaign--c1', name: 'Neptuno' };

        const result = await enricher.enrich(entity);

        expect(result.relatedObjects).toHaveLength(3);
        const relIds = result.relatedObjects.map((r) => r.relationship.id);
        expect(relIds).toContain('relationship--cm');
        expect(relIds).toContain('relationship--ca');
        expect(relIds).toContain('relationship--am');
        const peripheralRel = result.relatedObjects.find(
            (r) => r.relationship.id === 'relationship--am',
        );
        expect(peripheralRel?.object).toEqual(malware);
    });
});
