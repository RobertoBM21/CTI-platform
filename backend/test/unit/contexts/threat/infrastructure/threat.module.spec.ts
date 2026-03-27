import { Abstract } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IndicatorService } from '../../../../../src/contexts/threat/application/services/indicator.service';
import {
    AttackPatternRepository,
    CampaignRepository,
    IncidentRepository,
    IndicatorRepository,
    ThreatActorRepository,
} from '../../../../../src/contexts/threat/domain';
import { ThreatModule } from '../../../../../src/contexts/threat/infrastructure/threat.module';

describe('ThreatModule wiring', () => {
    let mongoServer: MongoMemoryServer;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                ThreatModule,
            ],
        }).compile();
    });

    afterAll(async () => {
        await moduleRef.close();
        await mongoServer.stop();
    });

    it('should resolve repository ports and key services from DI', () => {
        expect(
            moduleRef.get(ThreatActorRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(CampaignRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(IncidentRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(AttackPatternRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(
            moduleRef.get(IndicatorRepository as Abstract<unknown>),
        ).toBeDefined();
        expect(moduleRef.get(IndicatorService)).toBeDefined();
    });
});
