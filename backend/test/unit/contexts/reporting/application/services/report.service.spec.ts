import {
    ReportCatalogQueryDto,
    ReportCatalogSortBy,
} from '../../../../../../src/contexts/reporting/application/dtos/report-catalog-query.dto';
import { ReportService } from '../../../../../../src/contexts/reporting/application/services/report.service';
import {
    Report,
    ReportRepository,
} from '../../../../../../src/contexts/reporting/domain';
import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';

describe('ReportService', () => {
    it('should delegate list to report repository', async () => {
        const published = new Date('2024-01-01');
        const report = new Report({
            id: 'report--rep-1',
            name: 'Test Report',
            published,
        });
        const repository: ReportRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [report],
                meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
            }),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ReportService(repository);
        const result = await service.list({
            page: 1,
            limit: 20,
            name: 'Test',
            sortBy: ReportCatalogSortBy.UPDATED_AT,
            sortOrder: SortOrder.ASC,
        } as ReportCatalogQueryDto);

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'Test', tlp: undefined },
            1,
            20,
            { field: ReportCatalogSortBy.UPDATED_AT, direction: 1 },
        );
        expect(result.data[0]?.id).toBe('report--rep-1');
    });

    it('should delegate findById to report repository', async () => {
        const repository: ReportRepository = {
            findById: jest.fn().mockResolvedValue(
                new Report({
                    id: 'report--rep-1',
                    name: 'Test Report',
                    published: new Date(),
                }),
            ),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ReportService(repository);
        const result = await service.findById('report--rep-1');

        expect(repository.findById).toHaveBeenCalledWith('report--rep-1');
        expect(result?.id).toBe('report--rep-1');
    });

    it('should return null when report is not found', async () => {
        const repository: ReportRepository = {
            findById: jest.fn().mockResolvedValue(null),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ReportService(repository);
        const result = await service.findById('non-existent');

        expect(repository.findById).toHaveBeenCalledWith('non-existent');
        expect(result).toBeNull();
    });

    it('should delegate save to report repository', async () => {
        const published = new Date('2024-06-01');
        const report = new Report({
            id: 'report--rep-save',
            name: 'Save Test Report',
            published,
        });
        const repository: ReportRepository = {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn().mockResolvedValue(report),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ReportService(repository);
        const result = await service.save(report);

        expect(repository.save).toHaveBeenCalledWith(report);
        expect(result.id).toBe('report--rep-save');
    });

    it('should return empty data when no reports match', async () => {
        const repository: ReportRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
            }),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ReportService(repository);
        const result = await service.list({
            page: 1,
            limit: 20,
            sortBy: ReportCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        } as ReportCatalogQueryDto);

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });

    it('should sort DESC when sortOrder is DESC', async () => {
        const repository: ReportRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            }),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ReportService(repository);
        await service.list({
            page: 1,
            limit: 10,
            sortBy: ReportCatalogSortBy.PUBLISHED,
            sortOrder: SortOrder.DESC,
        } as ReportCatalogQueryDto);

        expect(repository.findAll).toHaveBeenCalledWith(
            expect.anything(),
            1,
            10,
            { field: ReportCatalogSortBy.PUBLISHED, direction: -1 },
        );
    });
});
