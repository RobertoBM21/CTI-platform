import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { IocListSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { IocService } from '../../../../../../src/contexts/threat/application/services/ioc.service';
import {
    Ioc,
    IocRepository,
} from '../../../../../../src/contexts/threat/domain';
import {
    IocType,
    TLP,
} from '../../../../../../src/contexts/threat/domain/value-objects';

describe('IocService', () => {
    function createRepository(
        overrides: Partial<IocRepository> = {},
    ): IocRepository {
        return {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [
                    new Ioc({
                        id: 'ioc-1',
                        type: IocType.IPV4,
                        value: '10.0.0.1',
                        sourceType: 'incident',
                        sourceId: 'inc-1',
                        tlp: TLP.WHITE,
                    }),
                ],
                meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
            }),
            findBySource: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            }),
            findByValue: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            ...overrides,
        };
    }

    it('should call findAll when source filter is not provided', async () => {
        const repository = createRepository();
        const service = new IocService(repository);

        await service.list({ page: 1, limit: 10, value: '10.0.0.1' });

        expect(repository.findAll).toHaveBeenCalledWith(
            { type: undefined, value: '10.0.0.1', tlp: undefined },
            1,
            10,
            { field: IocListSortBy.CREATED_AT, direction: -1 },
        );
        expect(repository.findBySource).not.toHaveBeenCalled();
    });

    it('should call findBySource when source filter is provided', async () => {
        const repository = createRepository();
        const service = new IocService(repository);

        await service.list({
            page: 2,
            limit: 5,
            sourceType: 'campaign',
            sourceId: 'camp-1',
            sortBy: IocListSortBy.VALUE,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findBySource).toHaveBeenCalledWith(
            'campaign',
            'camp-1',
            2,
            5,
            { field: IocListSortBy.VALUE, direction: 1 },
        );
        expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('should return empty data when no iocs match', async () => {
        const repository = createRepository({
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            }),
        });
        const service = new IocService(repository);

        const result = await service.list({ page: 1, limit: 10 });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
