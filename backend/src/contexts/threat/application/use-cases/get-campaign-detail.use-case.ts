import { Injectable } from '@nestjs/common';
import { Campaign, CampaignRepository } from '../../domain';
import { ThreatDetailQueryDto } from '../dtos';

@Injectable()
export class GetCampaignDetailUseCase {
    constructor(private readonly campaignRepository: CampaignRepository) {}

    execute(query: ThreatDetailQueryDto): Promise<Campaign | null> {
        return this.campaignRepository.findById(query.id);
    }
}
