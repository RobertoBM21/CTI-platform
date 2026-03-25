import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Campaign, CampaignRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos/threat-catalog-query.dto';

@Injectable()
export class CampaignService {
    constructor(private readonly campaignRepository: CampaignRepository) {}

    list(query: ThreatCatalogQueryDto): Promise<PaginatedResponse<Campaign>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.campaignRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<Campaign | null> {
        return this.campaignRepository.findById(id);
    }
}
