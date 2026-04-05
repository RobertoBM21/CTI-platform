import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Relationship } from '../../../../../../../src/contexts/shared/domain/entities/relationship.entity';
import { Sighting } from '../../../../../../../src/contexts/shared/domain/entities/sighting.entity';
import { RelationshipType } from '../../../../../../../src/contexts/shared/domain/value-objects/relationship-type.vo';
import { TLP } from '../../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';
import { RelationshipMongooseRepository } from '../../../../../../../src/contexts/shared/infrastructure/persistence/repositories/relationship-mongoose.repository';
import { SightingMongooseRepository } from '../../../../../../../src/contexts/shared/infrastructure/persistence/repositories/sighting-mongoose.repository';
import {
    RelationshipDocument,
    RelationshipSchema,
} from '../../../../../../../src/contexts/shared/infrastructure/persistence/schemas/relationship.schema';
import {
    SightingDocument,
    SightingSchema,
} from '../../../../../../../src/contexts/shared/infrastructure/persistence/schemas/sighting.schema';

describe('SRO repositories integration', () => {
    let mongoServer: MongoMemoryServer;
    let testingModule: TestingModule;

    let relationshipRepository: RelationshipMongooseRepository;
    let sightingRepository: SightingMongooseRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        testingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                MongooseModule.forFeature([
                    {
                        name: RelationshipDocument.name,
                        schema: RelationshipSchema,
                    },
                    {
                        name: SightingDocument.name,
                        schema: SightingSchema,
                    },
                ]),
            ],
            providers: [
                RelationshipMongooseRepository,
                SightingMongooseRepository,
            ],
        }).compile();

        relationshipRepository = testingModule.get(
            RelationshipMongooseRepository,
        );
        sightingRepository = testingModule.get(SightingMongooseRepository);
    });

    afterAll(async () => {
        await testingModule.close();
        await mongoServer.stop();
    });

    it('should persist and query Relationship by domain id', async () => {
        const rel = new Relationship({
            id: 'relationship--rel-int-1',
            relationshipType: RelationshipType.USES,
            sourceRef: 'threat-actor--silent-eco-collective',
            targetRef: 'attack-pattern--fabricate-evidence',
            tlp: TLP.AMBER,
        });

        const created = await relationshipRepository.save(rel);
        const found = await relationshipRepository.findById(
            'relationship--rel-int-1',
        );

        expect(created.id).toBe('relationship--rel-int-1');
        expect(found?.relationshipType).toBe(RelationshipType.USES);
        expect(found?.sourceRef).toBe('threat-actor--silent-eco-collective');
        expect(found?.targetRef).toBe('attack-pattern--fabricate-evidence');
        expect(found?.tlp).toBe(TLP.AMBER);
    });

    it('should find Relationships by sourceRef', async () => {
        const bySource = await relationshipRepository.findBySourceRef(
            'threat-actor--silent-eco-collective',
        );

        expect(bySource).toHaveLength(1);
        expect(bySource[0]?.id).toBe('relationship--rel-int-1');
    });

    it('should find Relationships by targetRef', async () => {
        const byTarget = await relationshipRepository.findByTargetRef(
            'attack-pattern--fabricate-evidence',
        );

        expect(byTarget).toHaveLength(1);
        expect(byTarget[0]?.id).toBe('relationship--rel-int-1');
    });

    it('should paginate and filter Relationships', async () => {
        await relationshipRepository.save(
            new Relationship({
                id: 'relationship--rel-int-2',
                relationshipType: RelationshipType.ATTRIBUTED_TO,
                sourceRef: 'campaign--operation-blackout',
                targetRef: 'threat-actor--silent-eco-collective',
                tlp: TLP.GREEN,
            }),
        );

        const page = await relationshipRepository.findAll(
            { relationshipType: RelationshipType.USES },
            1,
            10,
            { field: 'createdAt', direction: -1 },
        );

        expect(page.meta.total).toBe(1);
        expect(page.data[0]?.id).toBe('relationship--rel-int-1');
    });

    it('should persist and query Sighting by domain id', async () => {
        const sighting = new Sighting({
            id: 'sighting--sig-int-1',
            sightingOfRef: 'indicator--cobalt-strike-c2-beacon',
            count: 3,
            observedDataRefs: ['observed-data--pcap-20250301'],
            whereSightedRefs: ['identity--energy-sector-soc'],
            tlp: TLP.RED,
        });

        const created = await sightingRepository.save(sighting);
        const found = await sightingRepository.findById('sighting--sig-int-1');

        expect(created.id).toBe('sighting--sig-int-1');
        expect(found?.sightingOfRef).toBe('indicator--cobalt-strike-c2-beacon');
        expect(found?.count).toBe(3);
        expect(found?.observedDataRefs).toEqual([
            'observed-data--pcap-20250301',
        ]);
        expect(found?.whereSightedRefs).toEqual([
            'identity--energy-sector-soc',
        ]);
        expect(found?.tlp).toBe(TLP.RED);
    });

    it('should find Sightings by sightingOfRef', async () => {
        const bySightingOf = await sightingRepository.findBySightingOfRef(
            'indicator--cobalt-strike-c2-beacon',
        );

        expect(bySightingOf).toHaveLength(1);
        expect(bySightingOf[0]?.id).toBe('sighting--sig-int-1');
    });

    it('should update and delete SRO entities by domain id', async () => {
        const updated = await relationshipRepository.update(
            'relationship--rel-int-1',
            {
                description:
                    'Silent Eco Collective uses fabricated evidence in campaigns',
            },
        );
        const deleted = await sightingRepository.delete('sighting--sig-int-1');
        const notFound = await sightingRepository.findById(
            'sighting--sig-int-1',
        );

        expect(updated?.description).toBe(
            'Silent Eco Collective uses fabricated evidence in campaigns',
        );
        expect(deleted).toBe(true);
        expect(notFound).toBeNull();
    });
});
