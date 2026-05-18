import { Abstract } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ReportService } from '../../../../../src/contexts/reporting/application/services/report.service';
import { ReportRepository } from '../../../../../src/contexts/reporting/domain/ports/report.repository';
import { ReportingModule } from '../../../../../src/contexts/reporting/infrastructure/reporting.module';

describe('ReportingModule wiring', () => {
    let mongoServer: MongoMemoryServer;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                ReportingModule,
            ],
        }).compile();
    });

    afterAll(async () => {
        await moduleRef.close();
        await mongoServer.stop();
    });

    it('should resolve ReportRepository port from DI', () => {
        expect(
            moduleRef.get(ReportRepository as Abstract<unknown>),
        ).toBeDefined();
    });

    it('should resolve ReportService from DI', () => {
        expect(moduleRef.get(ReportService)).toBeDefined();
    });
});
