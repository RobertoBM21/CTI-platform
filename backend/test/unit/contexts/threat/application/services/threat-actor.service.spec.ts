import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { ThreatCatalogSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { ThreatActorService } from '../../../../../../src/contexts/threat/application/services/threat-actor.service';
import {
    ThreatActor,
    ThreatActorRepository,
} from '../../../../../../src/contexts/threat/domain';
import { TLP } from '../../../../../../src/contexts/threat/domain/value-objects';

describe('ThreatActorService', () => {
    it('should delegate list to threat actor repository', async () => {
        const actor = new ThreatActor({
            id: 'threat-actor--actor-1',
            name: 'APT-Unit',
            tlp: TLP.GREEN,
        });

        const repository: ThreatActorRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [actor],
                meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ThreatActorService(repository);
        const result = await service.list({
            page: 1,
            limit: 10,
            name: 'APT',
            tlp: TLP.GREEN,
            sortBy: ThreatCatalogSortBy.NAME,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'APT', tlp: TLP.GREEN },
            1,
            10,
            { field: ThreatCatalogSortBy.NAME, direction: 1 },
        );
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.id).toBe('threat-actor--actor-1');
    });

    it('should delegate findById to threat actor repository', async () => {
        const repository: ThreatActorRepository = {
            findById: jest.fn().mockResolvedValue(
                new ThreatActor({
                    id: 'threat-actor--actor-1',
                    name: 'Actor 1',
                }),
            ),
            findAll: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ThreatActorService(repository);
        const result = await service.findById('threat-actor--actor-1');

        expect(repository.findById).toHaveBeenCalledWith(
            'threat-actor--actor-1',
        );
        expect(result?.id).toBe('threat-actor--actor-1');
    });

    it('should return null when threat actor is not found', async () => {
        const repository: ThreatActorRepository = {
            findById: jest.fn().mockResolvedValue(null),
            findAll: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ThreatActorService(repository);
        const result = await service.findById('non-existent');

        expect(repository.findById).toHaveBeenCalledWith('non-existent');
        expect(result).toBeNull();
    });

    it('should return empty data when no threat actors match', async () => {
        const repository: ThreatActorRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            }),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new ThreatActorService(repository);
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
