import { Abstract } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
    CourseOfActionRepository,
    IdentityRepository,
    InfrastructureEntityRepository,
    IntrusionSetRepository,
    LocationRepository,
    MalwareRepository,
    NoteRepository,
    OpinionRepository,
    ToolRepository,
    VulnerabilityRepository,
} from '../../../../../src/contexts/cyber/domain';
import { CyberModule } from '../../../../../src/contexts/cyber/infrastructure/cyber.module';

describe('CyberModule wiring', () => {
    let mongoServer: MongoMemoryServer;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                CyberModule,
            ],
        }).compile();
    });

    afterAll(async () => {
        await moduleRef.close();
        await mongoServer.stop();
    });

    it('should resolve all 10 repository ports from DI', () => {
        expect(
            moduleRef.get(MalwareRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(ToolRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(VulnerabilityRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(InfrastructureEntityRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(IntrusionSetRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(IdentityRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(LocationRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(CourseOfActionRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(NoteRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(OpinionRepository as Abstract<unknown>),
        ).toBeDefined();
    });
});
