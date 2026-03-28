import { OpinionService } from '../../../../../../src/contexts/cyber/application/services/opinion.service';
import {
    Opinion,
    OpinionRepository,
} from '../../../../../../src/contexts/cyber/domain';
import { OpinionValue } from '../../../../../../src/contexts/cyber/domain/value-objects/opinion-value.vo';

describe('OpinionService', () => {
    it('should delegate findById to opinion repository', async () => {
        const opinion = new Opinion({
            id: 'opinion--o1',
            opinion: OpinionValue.AGREE,
        });
        const repository: Pick<OpinionRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(opinion),
        };

        const service = new OpinionService(repository as OpinionRepository);
        const result = await service.findById('opinion--o1');

        expect(repository.findById).toHaveBeenCalledWith('opinion--o1');
        expect(result?.id).toBe('opinion--o1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<OpinionRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new OpinionService(repository as OpinionRepository);
        const result = await service.findById('opinion--missing');

        expect(result).toBeNull();
    });
});
