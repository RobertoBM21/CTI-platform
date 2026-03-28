import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
    Location,
    Malware,
    Opinion,
} from '../../../../../../../src/contexts/cyber/domain';
import {
    MalwareType,
    OpinionValue,
    Region,
    TLP,
} from '../../../../../../../src/contexts/cyber/domain/value-objects';
import { LocationMongooseRepository } from '../../../../../../../src/contexts/cyber/infrastructure/persistence/repositories/location-mongoose.repository';
import { MalwareMongooseRepository } from '../../../../../../../src/contexts/cyber/infrastructure/persistence/repositories/malware-mongoose.repository';
import { OpinionMongooseRepository } from '../../../../../../../src/contexts/cyber/infrastructure/persistence/repositories/opinion-mongoose.repository';
import {
    LocationDocument,
    LocationSchema,
    MalwareDocument,
    MalwareSchema,
    OpinionDocument,
    OpinionSchema,
} from '../../../../../../../src/contexts/cyber/infrastructure/persistence/schemas';

describe('Cyber repositories integration', () => {
    let mongoServer: MongoMemoryServer;
    let testingModule: TestingModule;

    let malwareRepository: MalwareMongooseRepository;
    let locationRepository: LocationMongooseRepository;
    let opinionRepository: OpinionMongooseRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        testingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                MongooseModule.forFeature([
                    { name: MalwareDocument.name, schema: MalwareSchema },
                    { name: LocationDocument.name, schema: LocationSchema },
                    { name: OpinionDocument.name, schema: OpinionSchema },
                ]),
            ],
            providers: [
                MalwareMongooseRepository,
                LocationMongooseRepository,
                OpinionMongooseRepository,
            ],
        }).compile();

        malwareRepository = testingModule.get(MalwareMongooseRepository);
        locationRepository = testingModule.get(LocationMongooseRepository);
        opinionRepository = testingModule.get(OpinionMongooseRepository);
    });

    afterAll(async () => {
        await testingModule.close();
        await mongoServer.stop();
    });

    it('should persist and query Malware with killChainPhases and externalReferences', async () => {
        const malware = new Malware({
            id: 'malware--malware-int-1',
            name: 'Emotet',
            malwareTypes: [MalwareType.TROJAN],
            isFamily: true,
            killChainPhases: [
                {
                    killChainName: 'mitre-attack',
                    phaseName: 'initial-access',
                },
            ],
            externalReferences: [{ sourceName: 'MITRE', externalId: 'S0367' }],
            tlp: TLP.AMBER,
            confidence: 90,
        });

        const created = await malwareRepository.create(malware);
        const found = await malwareRepository.findById(
            'malware--malware-int-1',
        );

        expect(created.id).toBe('malware--malware-int-1');
        expect(found?.name).toBe('Emotet');
        expect(found?.malwareTypes).toEqual([MalwareType.TROJAN]);
        expect(found?.isFamily).toBe(true);
        expect(found?.killChainPhases).toEqual([
            { killChainName: 'mitre-attack', phaseName: 'initial-access' },
        ]);
        expect(found?.externalReferences).toEqual([
            { sourceName: 'MITRE', externalId: 'S0367' },
        ]);
        expect(found?.tlp).toBe(TLP.AMBER);
        expect(found?.confidence).toBe(90);
    });

    it('should persist and query Location with geo data', async () => {
        const location = new Location({
            id: 'location--loc-int-1',
            name: 'Madrid Office',
            latitude: 40.4168,
            longitude: -3.7038,
            country: 'ES',
            region: Region.EUROPE,
            city: 'Madrid',
            tlp: TLP.GREEN,
        });

        await locationRepository.create(location);
        const found = await locationRepository.findById('location--loc-int-1');

        expect(found?.id).toBe('location--loc-int-1');
        expect(found?.name).toBe('Madrid Office');
        expect(found?.latitude).toBeCloseTo(40.4168);
        expect(found?.longitude).toBeCloseTo(-3.7038);
        expect(found?.country).toBe('ES');
        expect(found?.region).toBe(Region.EUROPE);
        expect(found?.city).toBe('Madrid');
    });

    it('should persist and query Opinion (non-name entity)', async () => {
        const opinion = new Opinion({
            id: 'opinion--opinion-int-1',
            opinion: OpinionValue.AGREE,
            objectRefs: ['indicator--abc-123'],
            explanation: 'Confirmed via OSINT',
            authors: ['analyst-1'],
            tlp: TLP.GREEN,
            confidence: 75,
        });

        await opinionRepository.create(opinion);
        const found = await opinionRepository.findById(
            'opinion--opinion-int-1',
        );

        expect(found?.id).toBe('opinion--opinion-int-1');
        expect(found?.opinion).toBe(OpinionValue.AGREE);
        expect(found?.objectRefs).toEqual(['indicator--abc-123']);
        expect(found?.explanation).toBe('Confirmed via OSINT');
        expect(found?.authors).toEqual(['analyst-1']);
        expect(found?.confidence).toBe(75);
    });

    it('should update and delete entities by domain id', async () => {
        const updated = await malwareRepository.update(
            'malware--malware-int-1',
            {
                name: 'Emotet Updated',
            },
        );
        const deleted = await opinionRepository.delete(
            'opinion--opinion-int-1',
        );
        const notFound = await opinionRepository.findById(
            'opinion--opinion-int-1',
        );

        expect(updated?.name).toBe('Emotet Updated');
        expect(deleted).toBe(true);
        expect(notFound).toBeNull();
    });

    it('should apply requested sort order to paginated malware queries', async () => {
        await malwareRepository.create(
            new Malware({
                id: 'malware--malware-int-2',
                name: 'Zloader',
                malwareTypes: [MalwareType.TROJAN],
                isFamily: false,
            }),
        );
        await malwareRepository.create(
            new Malware({
                id: 'malware--malware-int-3',
                name: 'Amadey',
                malwareTypes: [MalwareType.BOT],
                isFamily: false,
            }),
        );

        const page = await malwareRepository.findAll({}, 1, 10, {
            field: 'name',
            direction: 1,
        });

        expect(page.data[0]?.name).toBe('Amadey');
        expect(page.data[1]?.name).toBe('Emotet Updated');
        expect(page.data[2]?.name).toBe('Zloader');
    });

    it('should apply requested sort order to paginated location queries', async () => {
        await locationRepository.create(
            new Location({
                id: 'location--loc-int-2',
                name: 'Zurich Lab',
                country: 'CH',
            }),
        );
        await locationRepository.create(
            new Location({
                id: 'location--loc-int-3',
                name: 'Austin Campus',
                country: 'US',
            }),
        );

        const page = await locationRepository.findAll({}, 1, 10, {
            field: 'name',
            direction: 1,
        });

        expect(page.data[0]?.name).toBe('Austin Campus');
        expect(page.data[1]?.name).toBe('Madrid Office');
        expect(page.data[2]?.name).toBe('Zurich Lab');
    });
});
