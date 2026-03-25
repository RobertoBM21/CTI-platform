import { SortOrder } from '../../../../../../src/contexts/shared/application/dtos/sort.dto';
import { ThreatCatalogSortBy } from '../../../../../../src/contexts/threat/application/dtos';
import { CampaignService } from '../../../../../../src/contexts/threat/application/services/campaign.service';
import {
    Campaign,
    CampaignRepository,
} from '../../../../../../src/contexts/threat/domain';

describe('CampaignService', () => {
    it('should delegate list to campaign repository', async () => {
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

        const service = new CampaignService(repository);
        const result = await service.list({
            page: 1,
            limit: 20,
            name: 'Camp',
            sortBy: ThreatCatalogSortBy.UPDATED_AT,
            sortOrder: SortOrder.ASC,
        });

        expect(repository.findAll).toHaveBeenCalledWith(
            { name: 'Camp', tlp: undefined },
            1,
            20,
            { field: ThreatCatalogSortBy.UPDATED_AT, direction: 1 },
        );
        expect(result.data[0]?.id).toBe('camp-1');
    });

    it('should delegate findById to campaign repository', async () => {
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

        const service = new CampaignService(repository);
        const result = await service.findById('camp-1');

        expect(repository.findById).toHaveBeenCalledWith('camp-1');
        expect(result?.id).toBe('camp-1');
    });

    it('should return null when campaign is not found', async () => {
        const repository: CampaignRepository = {
            findById: jest.fn().mockResolvedValue(null),
            findAll: jest.fn(),
            findByThreatActorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new CampaignService(repository);
        const result = await service.findById('non-existent');

        expect(repository.findById).toHaveBeenCalledWith('non-existent');
        expect(result).toBeNull();
    });

    it('should return empty data when no campaigns match', async () => {
        const repository: CampaignRepository = {
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
            }),
            findByThreatActorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const service = new CampaignService(repository);
        const result = await service.list({
            page: 1,
            limit: 20,
            sortBy: ThreatCatalogSortBy.CREATED_AT,
            sortOrder: SortOrder.DESC,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
