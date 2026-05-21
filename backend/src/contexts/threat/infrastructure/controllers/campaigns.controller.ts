import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { ThreatCatalogQueryDto } from '../../application/dtos';
import { CampaignService, DetailEnricher } from '../../application/services';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
    constructor(
        private readonly campaignService: CampaignService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List campaigns' })
    @ApiOkResponse({
        description: 'Campaigns retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { type: 'object', additionalProperties: true },
                },
            },
            additionalProperties: true,
        },
    })
    @ApiBadRequestResponse({ description: 'Invalid campaign query parameters' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.campaignService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get campaign detail' })
    @ApiOkResponse({
        description: 'Campaign retrieved successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiNotFoundResponse({ description: 'Campaign not found' })
    async detail(@Param('id') id: string) {
        const campaign = await this.campaignService.findById(id);

        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }

        return this.detailEnricher.enrich(campaign);
    }
}
