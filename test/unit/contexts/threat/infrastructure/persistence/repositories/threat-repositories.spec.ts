import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
    AttackPattern,
    Campaign,
    Incident,
    Ioc,
    ThreatActor,
} from '../../../../../../../src/contexts/threat/domain';
import {
    AttackMotivation,
    IocType,
    TLP,
} from '../../../../../../../src/contexts/threat/domain/value-objects';
import { AttackPatternMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/attack-pattern-mongoose.repository';
import { CampaignMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/campaign-mongoose.repository';
import { IncidentMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/incident-mongoose.repository';
import { IocMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/ioc-mongoose.repository';
import { ThreatActorMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/threat-actor-mongoose.repository';
import {
    AttackPatternDocument,
    AttackPatternSchema,
    CampaignDocument,
    CampaignSchema,
    IncidentDocument,
    IncidentSchema,
    IocDocument,
    IocSchema,
    ThreatActorDocument,
    ThreatActorSchema,
} from '../../../../../../../src/contexts/threat/infrastructure/persistence/schemas';

describe('Threat repositories integration', () => {
    let mongoServer: MongoMemoryServer;
    let testingModule: TestingModule;

    let threatActorRepository: ThreatActorMongooseRepository;
    let campaignRepository: CampaignMongooseRepository;
    let incidentRepository: IncidentMongooseRepository;
    let attackPatternRepository: AttackPatternMongooseRepository;
    let iocRepository: IocMongooseRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        testingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                MongooseModule.forFeature([
                    {
                        name: ThreatActorDocument.name,
                        schema: ThreatActorSchema,
                    },
                    { name: CampaignDocument.name, schema: CampaignSchema },
                    { name: IncidentDocument.name, schema: IncidentSchema },
                    {
                        name: AttackPatternDocument.name,
                        schema: AttackPatternSchema,
                    },
                    { name: IocDocument.name, schema: IocSchema },
                ]),
            ],
            providers: [
                ThreatActorMongooseRepository,
                CampaignMongooseRepository,
                IncidentMongooseRepository,
                AttackPatternMongooseRepository,
                IocMongooseRepository,
            ],
        }).compile();

        threatActorRepository = testingModule.get(
            ThreatActorMongooseRepository,
        );
        campaignRepository = testingModule.get(CampaignMongooseRepository);
        incidentRepository = testingModule.get(IncidentMongooseRepository);
        attackPatternRepository = testingModule.get(
            AttackPatternMongooseRepository,
        );
        iocRepository = testingModule.get(IocMongooseRepository);
    });

    afterAll(async () => {
        await testingModule.close();
        await mongoServer.stop();
    });

    it('should persist and query ThreatActor by domain id', async () => {
        const actor = new ThreatActor({
            id: 'actor-int-1',
            name: 'Actor Integration',
            tlp: TLP.AMBER,
        });

        const created = await threatActorRepository.create(actor);
        const found = await threatActorRepository.findById('actor-int-1');

        expect(created.id).toBe('actor-int-1');
        expect(found?.name).toBe('Actor Integration');
        expect(found?.tlp).toBe(TLP.AMBER);
    });

    it('should persist and query Campaign by related threat actor domain id', async () => {
        const campaign = new Campaign({
            id: 'camp-int-1',
            name: 'Campaign Integration',
            threatActorIds: ['actor-int-1'],
            primaryMotivations: [AttackMotivation.IDEOLOGY],
            tlp: TLP.GREEN,
        });

        await campaignRepository.create(campaign);
        const byThreatActor =
            await campaignRepository.findByThreatActorId('actor-int-1');

        expect(byThreatActor).toHaveLength(1);
        expect(byThreatActor[0]?.id).toBe('camp-int-1');
    });

    it('should persist and query Incident by campaign domain id', async () => {
        const incident = new Incident({
            id: 'inc-int-1',
            name: 'Incident Integration',
            campaignId: 'camp-int-1',
            threatActorIds: ['actor-int-1'],
            tlp: TLP.RED,
        });

        await incidentRepository.create(incident);
        const byCampaign =
            await incidentRepository.findByCampaignId('camp-int-1');

        expect(byCampaign).toHaveLength(1);
        expect(byCampaign[0]?.id).toBe('inc-int-1');
    });

    it('should persist and query AttackPattern by external reference', async () => {
        const attackPattern = new AttackPattern({
            id: 'ap-int-1',
            name: 'Credential Dumping',
            externalReference: 'T1003',
            tlp: TLP.WHITE,
        });

        await attackPatternRepository.create(attackPattern);
        const found =
            await attackPatternRepository.findByExternalReference('T1003');

        expect(found).not.toBeNull();
        expect(found?.id).toBe('ap-int-1');
    });

    it('should persist and query IoCs by source', async () => {
        const ioc = new Ioc({
            id: 'ioc-int-1',
            type: IocType.IPV4,
            value: '8.8.8.8',
            sourceType: 'incident',
            sourceId: 'inc-int-1',
            tlp: TLP.GREEN,
        });

        await iocRepository.create(ioc);
        const page = await iocRepository.findBySource(
            'incident',
            'inc-int-1',
            1,
            10,
            { field: 'createdAt', direction: -1 },
        );

        expect(page.meta.total).toBe(1);
        expect(page.data[0]?.id).toBe('ioc-int-1');
    });

    it('should update and delete entities by domain id', async () => {
        const updated = await threatActorRepository.update('actor-int-1', {
            name: 'Actor Updated',
        });
        const deleted = await iocRepository.delete('ioc-int-1');
        const notFound = await iocRepository.findById('ioc-int-1');

        expect(updated?.name).toBe('Actor Updated');
        expect(deleted).toBe(true);
        expect(notFound).toBeNull();
    });

    it('should apply requested sort order to paginated threat actor queries', async () => {
        await threatActorRepository.create(
            new ThreatActor({ id: 'actor-int-2', name: 'Zulu Actor' }),
        );
        await threatActorRepository.create(
            new ThreatActor({ id: 'actor-int-3', name: 'Alpha Actor' }),
        );

        const page = await threatActorRepository.findAll({}, 1, 10, {
            field: 'name',
            direction: 1,
        });

        expect(page.data[0]?.name).toBe('Actor Updated');
        expect(page.data[1]?.name).toBe('Alpha Actor');
        expect(page.data[2]?.name).toBe('Zulu Actor');
    });

    it('should apply requested sort order to IoC source queries', async () => {
        await iocRepository.create(
            new Ioc({
                id: 'ioc-int-2',
                type: IocType.DOMAIN,
                value: 'zzz.example',
                sourceType: 'incident',
                sourceId: 'inc-int-1',
            }),
        );
        await iocRepository.create(
            new Ioc({
                id: 'ioc-int-3',
                type: IocType.DOMAIN,
                value: 'aaa.example',
                sourceType: 'incident',
                sourceId: 'inc-int-1',
            }),
        );

        const page = await iocRepository.findBySource(
            'incident',
            'inc-int-1',
            1,
            10,
            { field: 'value', direction: 1 },
        );

        expect(page.data[0]?.value).toBe('aaa.example');
        expect(page.data[1]?.value).toBe('zzz.example');
    });
});
