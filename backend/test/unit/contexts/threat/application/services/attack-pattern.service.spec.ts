import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { ThreatCatalogSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { AttackPatternService } from '../../../../../../src/contexts/threat/application/services/attack-pattern.service';
import {
    AttackPattern,
    AttackPatternRepository,
} from '../../../../../../src/contexts/threat/domain';

describe('AttackPatternService', () => {
    it('should delegate list to attack pattern repository', async () => {
        const attackPattern = new AttackPattern({
            id: 'attack-pattern--ap-1',
            name: 'Attack Pattern 1',
        });
        const repository: AttackPatternRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [attackPattern],
                meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
            }),
            findByExternalReference: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new AttackPatternService(repository);
        const result = await service.list({
            page: 1,
            limit: 5,
            sortBy: ThreatCatalogSortBy.NAME,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: undefined, tlp: undefined },
            1,
            5,
            { field: ThreatCatalogSortBy.NAME, direction: 1 },
        );
        expect(result.data[0]?.id).toBe('attack-pattern--ap-1');
    });

    it('should delegate findById to attack pattern repository', async () => {
        const repository: AttackPatternRepository = {
            findById: jest.fn().mockResolvedValue(
                new AttackPattern({
                    id: 'attack-pattern--ap-1',
                    name: 'Attack Pattern 1',
                }),
            ),
            findAll: jest.fn(),
            findByExternalReference: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new AttackPatternService(repository);
        const result = await service.findById('attack-pattern--ap-1');

        expect(repository.findById).toHaveBeenCalledWith(
            'attack-pattern--ap-1',
        );
        expect(result?.id).toBe('attack-pattern--ap-1');
    });

    it('should return null when attack pattern is not found', async () => {
        const repository: AttackPatternRepository = {
            findById: jest.fn().mockResolvedValue(null),
            findAll: jest.fn(),
            findByExternalReference: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new AttackPatternService(repository);
        const result = await service.findById('non-existent');

        expect(repository.findById).toHaveBeenCalledWith('non-existent');
        expect(result).toBeNull();
    });

    it('should return empty data when no attack patterns match', async () => {
        const repository: AttackPatternRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 5, totalPages: 0 },
            }),
            findByExternalReference: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new AttackPatternService(repository);
        const result = await service.list({
            page: 1,
            limit: 5,
            sortBy: ThreatCatalogSortBy.NAME,
            sortOrder: SortOrder.ASC,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
