import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
    AttackPattern,
    Campaign,
    Incident,
    Indicator,
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
import { IndicatorMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/indicator-mongoose.repository';
import { ThreatActorMongooseRepository } from '../../../../../../../src/contexts/threat/infrastructure/persistence/repositories/threat-actor-mongoose.repository';
import {
    AttackPatternDocument,
    AttackPatternSchema,
    CampaignDocument,
    CampaignSchema,
    IncidentDocument,
    IncidentSchema,
    IndicatorDocument,
    IndicatorSchema,
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
    let indicatorRepository: IndicatorMongooseRepository;

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
                    {
                        name: IndicatorDocument.name,
                        schema: IndicatorSchema,
                    },
                ]),
            ],
            providers: [
                ThreatActorMongooseRepository,
                CampaignMongooseRepository,
                IncidentMongooseRepository,
                AttackPatternMongooseRepository,
                IndicatorMongooseRepository,
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
        indicatorRepository = testingModule.get(IndicatorMongooseRepository);
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

    it('should persist and query Campaign with STIX common props', async () => {
        const campaign = new Campaign({
            id: 'camp-int-1',
            name: 'Campaign Integration',
            primaryMotivations: [AttackMotivation.IDEOLOGY],
            confidence: 80,
            externalReferences: [
                { sourceName: 'OSINT', externalId: 'CAMP-001' },
            ],
            tlp: TLP.GREEN,
        });

        await campaignRepository.create(campaign);
        const found = await campaignRepository.findById('camp-int-1');

        expect(found?.id).toBe('camp-int-1');
        expect(found?.confidence).toBe(80);
        expect(found?.revoked).toBe(false);
        expect(found?.externalReferences).toEqual([
            { sourceName: 'OSINT', externalId: 'CAMP-001' },
        ]);
    });

    it('should persist and query Incident with STIX common props', async () => {
        const incident = new Incident({
            id: 'inc-int-1',
            name: 'Incident Integration',
            confidence: 60,
            tlp: TLP.RED,
        });

        await incidentRepository.create(incident);
        const found = await incidentRepository.findById('inc-int-1');

        expect(found?.id).toBe('inc-int-1');
        expect(found?.confidence).toBe(60);
        expect(found?.revoked).toBe(false);
        expect(found?.externalReferences).toEqual([]);
    });

    it('should persist and query AttackPattern by external reference', async () => {
        const attackPattern = new AttackPattern({
            id: 'ap-int-1',
            name: 'Credential Dumping',
            externalReference: 'T1003',
            confidence: 95,
            externalReferences: [{ sourceName: 'DISARM', externalId: 'T1003' }],
            tlp: TLP.WHITE,
        });

        await attackPatternRepository.create(attackPattern);
        const found =
            await attackPatternRepository.findByExternalReference('T1003');

        expect(found).not.toBeNull();
        expect(found?.id).toBe('ap-int-1');
        expect(found?.confidence).toBe(95);
        expect(found?.externalReferences).toEqual([
            { sourceName: 'DISARM', externalId: 'T1003' },
        ]);
    });

    it('should persist and query Indicator by value', async () => {
        const indicator = new Indicator({
            id: 'ind-int-1',
            type: IocType.IPV4,
            value: '8.8.8.8',
            name: 'Google DNS',
            confidence: 50,
            killChainPhases: [
                {
                    killChainName: 'mitre-attack',
                    phaseName: 'command-and-control',
                },
            ],
            externalReferences: [
                { sourceName: 'OSINT', externalId: 'IND-001' },
            ],
            tlp: TLP.GREEN,
        });

        await indicatorRepository.create(indicator);
        const found = await indicatorRepository.findByValue('8.8.8.8');

        expect(found).toHaveLength(1);
        expect(found[0]?.id).toBe('ind-int-1');
        expect(found[0]?.name).toBe('Google DNS');
        expect(found[0]?.confidence).toBe(50);
        expect(found[0]?.killChainPhases).toEqual([
            { killChainName: 'mitre-attack', phaseName: 'command-and-control' },
        ]);
        expect(found[0]?.externalReferences).toEqual([
            { sourceName: 'OSINT', externalId: 'IND-001' },
        ]);
    });

    it('should update and delete entities by domain id', async () => {
        const updated = await threatActorRepository.update('actor-int-1', {
            name: 'Actor Updated',
        });
        const deleted = await indicatorRepository.delete('ind-int-1');
        const notFound = await indicatorRepository.findById('ind-int-1');

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

    it('should apply requested sort order to paginated indicator queries', async () => {
        await indicatorRepository.create(
            new Indicator({
                id: 'ind-int-2',
                type: IocType.DOMAIN,
                value: 'zzz.example',
            }),
        );
        await indicatorRepository.create(
            new Indicator({
                id: 'ind-int-3',
                type: IocType.DOMAIN,
                value: 'aaa.example',
            }),
        );

        const page = await indicatorRepository.findAll({}, 1, 10, {
            field: 'value',
            direction: 1,
        });

        expect(page.data[0]?.value).toBe('aaa.example');
        expect(page.data[1]?.value).toBe('zzz.example');
    });
});
