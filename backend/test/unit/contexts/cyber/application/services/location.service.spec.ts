import { LocationCatalogSortBy } from '../../../../../../src/contexts/cyber/application/dtos/location-catalog-query.dto';
import { LocationService } from '../../../../../../src/contexts/cyber/application/services/location.service';
import {
    Location,
    LocationRepository,
} from '../../../../../../src/contexts/cyber/domain';
import { TLP } from '../../../../../../src/contexts/cyber/domain/value-objects';
import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';

describe('LocationService', () => {
    it('should delegate list to location repository', async () => {
        const loc = new Location({ id: 'location--l1', name: 'Madrid Office' });
        const repository: LocationRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [loc],
                meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new LocationService(repository);
        const result = await service.list({
            page: 1,
            limit: 25,
            name: 'Madrid',
            tlp: TLP.WHITE,
            sortBy: LocationCatalogSortBy.NAME,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'Madrid', tlp: TLP.WHITE },
            1,
            25,
            { field: LocationCatalogSortBy.NAME, direction: 1 },
        );
        expect(result.data[0]?.id).toBe('location--l1');
    });

    it('should return empty data when no locations match', async () => {
        const repository: LocationRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 25, totalPages: 0 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new LocationService(repository);
        const result = await service.list({
            page: 1,
            limit: 25,
            sortBy: LocationCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });

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
