import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { ThreatCatalogSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { ListThreatActorsUseCase } from '../../../../../../src/contexts/threat/application/use-cases/list-threat-actors.use-case';
import {
    ThreatActor,
    ThreatActorRepository,
} from '../../../../../../src/contexts/threat/domain';
import { TLP } from '../../../../../../src/contexts/threat/domain/value-objects';

describe('ListThreatActorsUseCase', () => {
    it('should delegate filter and pagination to repository', async () => {
        const actor = new ThreatActor({
            id: 'actor-1',
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
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new ListThreatActorsUseCase(repository);
        const result = await useCase.execute({
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
        expect(result.data[0]?.id).toBe('actor-1');
    });
});
