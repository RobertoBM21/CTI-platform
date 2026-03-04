import { ListIocsUseCase } from '../../../../../../src/contexts/threat/application/use-cases/list-iocs.use-case';
import {
    Ioc,
    IocRepository,
} from '../../../../../../src/contexts/threat/domain';
import {
    IocType,
    TLP,
} from '../../../../../../src/contexts/threat/domain/value-objects';

describe('ListIocsUseCase', () => {
    const repository: IocRepository = {
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
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call findAll when source filter is not provided', async () => {
        const useCase = new ListIocsUseCase(repository);

        await useCase.execute({ page: 1, limit: 10, value: '10.0.0.1' });

        expect(repository.findAll).toHaveBeenCalledWith(
            { type: undefined, value: '10.0.0.1', tlp: undefined },
            1,
            10,
        );
        expect(repository.findBySource).not.toHaveBeenCalled();
    });

    it('should call findBySource when source filter is provided', async () => {
        const useCase = new ListIocsUseCase(repository);

        await useCase.execute({
            page: 2,
            limit: 5,
            sourceType: 'campaign',
            sourceId: 'camp-1',
        });

        expect(repository.findBySource).toHaveBeenCalledWith(
            'campaign',
            'camp-1',
            2,
            5,
        );
        expect(repository.findAll).not.toHaveBeenCalled();
    });
});
