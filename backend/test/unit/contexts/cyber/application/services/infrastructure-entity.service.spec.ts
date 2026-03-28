import { InfrastructureEntityService } from '../../../../../../src/contexts/cyber/application/services/infrastructure-entity.service';
import {
    InfrastructureEntity,
    InfrastructureEntityRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('InfrastructureEntityService', () => {
    it('should delegate findById to infrastructure entity repository', async () => {
        const infra = new InfrastructureEntity({
            id: 'infrastructure--i1',
            name: 'C2 Server',
        });
        const repository: Pick<InfrastructureEntityRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(infra),
        };

        const service = new InfrastructureEntityService(
            repository as InfrastructureEntityRepository,
        );
        const result = await service.findById('infrastructure--i1');

        expect(repository.findById).toHaveBeenCalledWith('infrastructure--i1');
        expect(result?.id).toBe('infrastructure--i1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<InfrastructureEntityRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new InfrastructureEntityService(
            repository as InfrastructureEntityRepository,
        );
        const result = await service.findById('infrastructure--missing');

        expect(result).toBeNull();
    });
});
