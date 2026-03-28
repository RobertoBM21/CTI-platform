import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { ThreatCatalogSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { IncidentService } from '../../../../../../src/contexts/threat/application/services/incident.service';
import {
    Incident,
    IncidentRepository,
} from '../../../../../../src/contexts/threat/domain';
import { TLP } from '../../../../../../src/contexts/threat/domain/value-objects';

describe('IncidentService', () => {
    it('should delegate list to incident repository', async () => {
        const incident = new Incident({
            id: 'incident--inc-1',
            name: 'Incident 1',
        });
        const repository: IncidentRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [incident],
                meta: { total: 1, page: 2, limit: 10, totalPages: 1 },
            }),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new IncidentService(repository);
        const result = await service.list({
            page: 2,
            limit: 10,
            tlp: TLP.AMBER,
            sortBy: ThreatCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: undefined, tlp: TLP.AMBER },
            2,
            10,
            { field: ThreatCatalogSortBy.CREATED_AT, direction: -1 },
        );
        expect(result.data[0]?.id).toBe('incident--inc-1');
    });

    it('should delegate findById to incident repository', async () => {
        const repository: IncidentRepository = {
            findById: jest
                .fn()
                .mockResolvedValue(
                    new Incident({ id: 'incident--inc-1', name: 'Incident 1' }),
                ),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new IncidentService(repository);
        const result = await service.findById('incident--inc-1');

        expect(repository.findById).toHaveBeenCalledWith('incident--inc-1');
        expect(result?.id).toBe('incident--inc-1');
    });

    it('should return null when incident is not found', async () => {
        const repository: IncidentRepository = {
            findById: jest.fn().mockResolvedValue(null),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new IncidentService(repository);
        const result = await service.findById('non-existent');

        expect(repository.findById).toHaveBeenCalledWith('non-existent');
        expect(result).toBeNull();
    });

    it('should return empty data when no incidents match', async () => {
        const repository: IncidentRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            }),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new IncidentService(repository);
        const result = await service.list({
            page: 1,
            limit: 10,
            sortBy: ThreatCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
