import { ToolCatalogSortBy } from '../../../../../../src/contexts/cyber/application/dtos/tool-catalog-query.dto';
import { ToolService } from '../../../../../../src/contexts/cyber/application/services/tool.service';
import {
    Tool,
    ToolRepository,
} from '../../../../../../src/contexts/cyber/domain';
import { TLP } from '../../../../../../src/contexts/cyber/domain/value-objects';
import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';

describe('ToolService', () => {
    it('should delegate list to tool repository', async () => {
        const tool = new Tool({ id: 'tool--t1', name: 'Mimikatz' });
        const repository: ToolRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [tool],
                meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ToolService(repository);
        const result = await service.list({
            page: 1,
            limit: 20,
            name: 'Mi',
            tlp: TLP.GREEN,
            sortBy: ToolCatalogSortBy.UPDATED_AT,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'Mi', tlp: TLP.GREEN },
            1,
            20,
            { field: ToolCatalogSortBy.UPDATED_AT, direction: 1 },
        );
        expect(result.data[0]?.id).toBe('tool--t1');
    });

    it('should return empty data when no tools match', async () => {
        const repository: ToolRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ToolService(repository);
        const result = await service.list({
            page: 1,
            limit: 20,
            sortBy: ToolCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });

    it('should delegate findById to tool repository', async () => {
        const tool = new Tool({ id: 'tool--t1', name: 'Mimikatz' });
        const repository: Pick<ToolRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(tool),
        };

        const service = new ToolService(repository as ToolRepository);
        const result = await service.findById('tool--t1');

        expect(repository.findById).toHaveBeenCalledWith('tool--t1');
        expect(result?.id).toBe('tool--t1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<ToolRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new ToolService(repository as ToolRepository);
        const result = await service.findById('tool--missing');

        expect(result).toBeNull();
    });
});
