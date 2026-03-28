import { SightingService } from '../../../../../../src/contexts/shared/application/services/sighting.service';
import {
    Sighting,
    SightingRepository,
} from '../../../../../../src/contexts/shared/domain';

describe('SightingService', () => {
    const sighting = new Sighting({
        id: 'sighting--s1',
        sightingOfRef: 'indicator--ind1',
    });

    function createRepository(
        overrides: Partial<SightingRepository> = {},
    ): SightingRepository {
        return {
            findById: jest.fn().mockResolvedValue(sighting),
            findBySightingOfRef: jest.fn().mockResolvedValue([sighting]),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            ...overrides,
        };
    }

    it('should delegate findById to repository', async () => {
        const repository = createRepository();
        const service = new SightingService(repository);

        const result = await service.findById('sighting--s1');

        expect(repository.findById).toHaveBeenCalledWith('sighting--s1');
        expect(result?.id).toBe('sighting--s1');
    });

    it('should delegate findBySightingOfRef to repository', async () => {
        const repository = createRepository();
        const service = new SightingService(repository);

        const result = await service.findBySightingOfRef('indicator--ind1');

        expect(repository.findBySightingOfRef).toHaveBeenCalledWith(
            'indicator--ind1',
        );
        expect(result).toHaveLength(1);
    });

    it('should return null when not found', async () => {
        const repository = createRepository({
            findById: jest.fn().mockResolvedValue(null),
        });
        const service = new SightingService(repository);

        const result = await service.findById('sighting--missing');

        expect(result).toBeNull();
    });
});
