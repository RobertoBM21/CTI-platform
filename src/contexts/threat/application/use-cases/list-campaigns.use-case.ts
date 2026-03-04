import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { Campaign, CampaignRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos';

@Injectable()
export class ListCampaignsUseCase {
    constructor(private readonly campaignRepository: CampaignRepository) {}

    execute(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<Campaign>> {
        return this.campaignRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
        );
    }
}
