import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { IndicatorListSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { IndicatorService } from '../../../../../../src/contexts/threat/application/services/indicator.service';
import {
    Indicator,
    IndicatorRepository,
} from '../../../../../../src/contexts/threat/domain';
import {
    IocType,
    TLP,
} from '../../../../../../src/contexts/threat/domain/value-objects';

describe('IndicatorService', () => {
    function createRepository(
        overrides: Partial<IndicatorRepository> = {},
    ): IndicatorRepository {
        return {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [
                    new Indicator({
                        id: 'indicator--ind-1',
                        type: IocType.IPV4,
                        value: '10.0.0.1',
                        tlp: TLP.WHITE,
                    }),
                ],
                meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
            }),
            findByValue: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            ...overrides,
        };
    }

    it('should call findAll with filter and default sort', async () => {
        const repository = createRepository();
        const service = new IndicatorService(repository);

        await service.list({ page: 1, limit: 10, value: '10.0.0.1' });

        expect(repository.findAll).toHaveBeenCalledWith(
            {
                type: undefined,
                value: '10.0.0.1',
                name: undefined,
                tlp: undefined,
            },
            1,
            10,
            { field: IndicatorListSortBy.CREATED_AT, direction: -1 },
        );
    });

    it('should call findAll with name filter', async () => {
        const repository = createRepository();
        const service = new IndicatorService(repository);

        await service.list({
            page: 1,
            limit: 5,
            name: 'Malicious',
            sortBy: IndicatorListSortBy.NAME,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            {
                type: undefined,
                value: undefined,
                name: 'Malicious',
                tlp: undefined,
            },
            1,
            5,
            { field: IndicatorListSortBy.NAME, direction: 1 },
        );
    });

    it('should delegate findById to indicator repository', async () => {
        const repository = createRepository({
            findById: jest.fn().mockResolvedValue(
                new Indicator({
                    id: 'indicator--ind-1',
                    type: IocType.IPV4,
                    value: '10.0.0.1',
                }),
            ),
        });
        const service = new IndicatorService(repository);

        const result = await service.findById('indicator--ind-1');

        expect(repository.findById).toHaveBeenCalledWith('indicator--ind-1');
        expect(result?.id).toBe('indicator--ind-1');
    });

    it('should return null when indicator is not found', async () => {
        const repository = createRepository({
            findById: jest.fn().mockResolvedValue(null),
        });
        const service = new IndicatorService(repository);

        const result = await service.findById('non-existent');

        expect(repository.findById).toHaveBeenCalledWith('non-existent');
        expect(result).toBeNull();
    });

    it('should return empty data when no indicators match', async () => {
        const repository = createRepository({
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            }),
        });
        const service = new IndicatorService(repository);

        const result = await service.list({ page: 1, limit: 10 });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
