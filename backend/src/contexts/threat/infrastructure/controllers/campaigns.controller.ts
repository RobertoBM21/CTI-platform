import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { ThreatCatalogQueryDto } from '../../application/dtos';
import {
    GetCampaignDetailUseCase,
    ListCampaignsUseCase,
} from '../../application/use-cases';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
    constructor(
        private readonly listCampaignsUseCase: ListCampaignsUseCase,
        private readonly getCampaignDetailUseCase: GetCampaignDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List campaigns' })
    @ApiOkResponse({ description: 'Campaigns retrieved successfully' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.listCampaignsUseCase.execute(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get campaign detail' })
    @ApiOkResponse({ description: 'Campaign retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Campaign not found' })
    async detail(@Param('id') id: string) {
        const campaign = await this.getCampaignDetailUseCase.execute({ id });

        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }

        return campaign;
    }
}
