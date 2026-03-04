import { GetAttackPatternDetailUseCase } from '../../../../../../src/contexts/threat/application/use-cases/get-attack-pattern-detail.use-case';
import { GetCampaignDetailUseCase } from '../../../../../../src/contexts/threat/application/use-cases/get-campaign-detail.use-case';
import { GetIncidentDetailUseCase } from '../../../../../../src/contexts/threat/application/use-cases/get-incident-detail.use-case';
import { GetThreatActorDetailUseCase } from '../../../../../../src/contexts/threat/application/use-cases/get-threat-actor-detail.use-case';
import { ListAttackPatternsUseCase } from '../../../../../../src/contexts/threat/application/use-cases/list-attack-patterns.use-case';
import { ListCampaignsUseCase } from '../../../../../../src/contexts/threat/application/use-cases/list-campaigns.use-case';
import { ListIncidentsUseCase } from '../../../../../../src/contexts/threat/application/use-cases/list-incidents.use-case';
import {
    AttackPattern,
    AttackPatternRepository,
    Campaign,
    CampaignRepository,
    Incident,
    IncidentRepository,
    ThreatActor,
    ThreatActorRepository,
} from '../../../../../../src/contexts/threat/domain';
import { TLP } from '../../../../../../src/contexts/threat/domain/value-objects';

describe('Threat catalog/detail use cases', () => {
    it('should delegate list campaigns to campaign repository', async () => {
        const campaign = new Campaign({ id: 'camp-1', name: 'Campaign 1' });
        const repository: CampaignRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [campaign],
                meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
            }),
            findByThreatActorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new ListCampaignsUseCase(repository);
        const result = await useCase.execute({
            page: 1,
            limit: 20,
            name: 'Camp',
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'Camp', tlp: undefined },
            1,
            20,
        );
        expect(result.data[0]?.id).toBe('camp-1');
    });

    it('should delegate list incidents to incident repository', async () => {
        const incident = new Incident({ id: 'inc-1', name: 'Incident 1' });
        const repository: IncidentRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [incident],
                meta: { total: 1, page: 2, limit: 10, totalPages: 1 },
            }),
            findByCampaignId: jest.fn(),
            findByThreatActorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new ListIncidentsUseCase(repository);
        const result = await useCase.execute({
            page: 2,
            limit: 10,
            tlp: TLP.AMBER,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: undefined, tlp: TLP.AMBER },
            2,
            10,
        );
        expect(result.data[0]?.id).toBe('inc-1');
    });

    it('should delegate list attack patterns to attack pattern repository', async () => {
        const attackPattern = new AttackPattern({
            id: 'ap-1',
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

        const useCase = new ListAttackPatternsUseCase(repository);
        const result = await useCase.execute({ page: 1, limit: 5 });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: undefined, tlp: undefined },
            1,
            5,
        );
        expect(result.data[0]?.id).toBe('ap-1');
    });

    it('should delegate threat actor detail to threat actor repository', async () => {
        const repository: ThreatActorRepository = {
            findById: jest
                .fn()
                .mockResolvedValue(
                    new ThreatActor({ id: 'actor-1', name: 'Actor 1' }),
                ),
            findAll: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new GetThreatActorDetailUseCase(repository);
        const result = await useCase.execute({ id: 'actor-1' });

        expect(repository.findById).toHaveBeenCalledWith('actor-1');
        expect(result?.id).toBe('actor-1');
    });

    it('should delegate campaign detail to campaign repository', async () => {
        const repository: CampaignRepository = {
            findById: jest
                .fn()
                .mockResolvedValue(
                    new Campaign({ id: 'camp-1', name: 'Campaign 1' }),
                ),
            findAll: jest.fn(),
            findByThreatActorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new GetCampaignDetailUseCase(repository);
        const result = await useCase.execute({ id: 'camp-1' });

        expect(repository.findById).toHaveBeenCalledWith('camp-1');
        expect(result?.id).toBe('camp-1');
    });

    it('should delegate incident detail to incident repository', async () => {
        const repository: IncidentRepository = {
            findById: jest
                .fn()
                .mockResolvedValue(
                    new Incident({ id: 'inc-1', name: 'Incident 1' }),
                ),
            findAll: jest.fn(),
            findByCampaignId: jest.fn(),
            findByThreatActorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new GetIncidentDetailUseCase(repository);
        const result = await useCase.execute({ id: 'inc-1' });

        expect(repository.findById).toHaveBeenCalledWith('inc-1');
        expect(result?.id).toBe('inc-1');
    });

    it('should delegate attack pattern detail to attack pattern repository', async () => {
        const repository: AttackPatternRepository = {
            findById: jest
                .fn()
                .mockResolvedValue(
                    new AttackPattern({ id: 'ap-1', name: 'Attack Pattern 1' }),
                ),
            findAll: jest.fn(),
            findByExternalReference: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new GetAttackPatternDetailUseCase(repository);
        const result = await useCase.execute({ id: 'ap-1' });

        expect(repository.findById).toHaveBeenCalledWith('ap-1');
        expect(result?.id).toBe('ap-1');
    });
});
