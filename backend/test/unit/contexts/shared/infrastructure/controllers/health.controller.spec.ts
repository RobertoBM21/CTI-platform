import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../../../../src/contexts/shared/infrastructure/controllers/health.controller';
import { HealthService } from '../../../../../../src/contexts/shared/infrastructure/health.service';

describe('HealthController', () => {
    let controller: HealthController;
    const healthService = {
        check: jest.fn().mockReturnValue({
            status: 'ok',
            timestamp: '2026-03-06T00:00:00.000Z',
            database: { status: 'up' },
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: HealthService,
                    useValue: healthService,
                },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return status ok with timestamp', () => {
        const result = controller.check();

        expect(result).toHaveProperty('status', 'ok');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('database.status', 'up');
        expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    });
});
