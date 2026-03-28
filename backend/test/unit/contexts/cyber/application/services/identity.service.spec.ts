import { IdentityService } from '../../../../../../src/contexts/cyber/application/services/identity.service';
import {
    Identity,
    IdentityRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('IdentityService', () => {
    it('should delegate findById to identity repository', async () => {
        const identity = new Identity({
            id: 'identity--id1',
            name: 'ACME Corp',
        });
        const repository: Pick<IdentityRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(identity),
        };

        const service = new IdentityService(repository as IdentityRepository);
        const result = await service.findById('identity--id1');

        expect(repository.findById).toHaveBeenCalledWith('identity--id1');
        expect(result?.id).toBe('identity--id1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<IdentityRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new IdentityService(repository as IdentityRepository);
        const result = await service.findById('identity--missing');

        expect(result).toBeNull();
    });
});
