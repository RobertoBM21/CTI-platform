import { IntrusionSetCatalogSortBy } from '../../../../../../src/contexts/cyber/application/dtos/intrusion-set-catalog-query.dto';
import { IntrusionSetService } from '../../../../../../src/contexts/cyber/application/services/intrusion-set.service';
import {
    IntrusionSet,
    IntrusionSetRepository,
} from '../../../../../../src/contexts/cyber/domain';
import { TLP } from '../../../../../../src/contexts/cyber/domain/value-objects';
import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';

describe('IntrusionSetService', () => {
    it('should delegate list to intrusion set repository', async () => {
        const intrusionSet = new IntrusionSet({
            id: 'intrusion-set--is1',
            name: 'APT28',
        });
        const repository: IntrusionSetRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [intrusionSet],
                meta: { total: 1, page: 3, limit: 15, totalPages: 1 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new IntrusionSetService(repository);
        const result = await service.list({
            page: 3,
            limit: 15,
            name: 'APT',
            tlp: TLP.GREEN,
            sortBy: IntrusionSetCatalogSortBy.UPDATED_AT,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'APT', tlp: TLP.GREEN },
            3,
            15,
            { field: IntrusionSetCatalogSortBy.UPDATED_AT, direction: 1 },
        );
        expect(result.data[0]?.id).toBe('intrusion-set--is1');
    });

    it('should return empty data when no intrusion sets match', async () => {
        const repository: IntrusionSetRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 15, totalPages: 0 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new IntrusionSetService(repository);
        const result = await service.list({
            page: 1,
            limit: 15,
            sortBy: IntrusionSetCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });

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
