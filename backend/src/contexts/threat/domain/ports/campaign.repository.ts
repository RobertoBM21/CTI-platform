import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Campaign } from '../entities/campaign.entity';

export abstract class CampaignRepository {
    abstract findById(id: string): Promise<Campaign | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Campaign>>;

    abstract create(entity: Campaign): Promise<Campaign>;

    abstract update(
        id: string,
        entity: Partial<Campaign>,
    ): Promise<Campaign | null>;

    abstract delete(id: string): Promise<boolean>;
}
