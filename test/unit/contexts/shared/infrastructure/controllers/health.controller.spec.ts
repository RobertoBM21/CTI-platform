import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../../../../src/contexts/shared/infrastructure/controllers/health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
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
        expect(() => new Date(result.timestamp)).not.toThrow();
    });
});
