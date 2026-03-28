import { IntrusionSetService } from '../../../../../../src/contexts/cyber/application/services/intrusion-set.service';
import {
    IntrusionSet,
    IntrusionSetRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('IntrusionSetService', () => {
    it('should delegate findById to intrusion set repository', async () => {
        const is = new IntrusionSet({
            id: 'intrusion-set--is1',
            name: 'APT28',
        });
        const repository: Pick<IntrusionSetRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(is),
        };

        const service = new IntrusionSetService(
            repository as IntrusionSetRepository,
        );
        const result = await service.findById('intrusion-set--is1');

        expect(repository.findById).toHaveBeenCalledWith('intrusion-set--is1');
        expect(result?.id).toBe('intrusion-set--is1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<IntrusionSetRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new IntrusionSetService(
            repository as IntrusionSetRepository,
        );
        const result = await service.findById('intrusion-set--missing');

        expect(result).toBeNull();
    });
});
