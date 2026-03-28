import { LocationService } from '../../../../../../src/contexts/cyber/application/services/location.service';
import {
    Location,
    LocationRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('LocationService', () => {
    it('should delegate findById to location repository', async () => {
        const loc = new Location({ id: 'location--l1', name: 'Madrid Office' });
        const repository: Pick<LocationRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(loc),
        };

        const service = new LocationService(repository as LocationRepository);
        const result = await service.findById('location--l1');

        expect(repository.findById).toHaveBeenCalledWith('location--l1');
        expect(result?.id).toBe('location--l1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<LocationRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new LocationService(repository as LocationRepository);
        const result = await service.findById('location--missing');

        expect(result).toBeNull();
    });
});
