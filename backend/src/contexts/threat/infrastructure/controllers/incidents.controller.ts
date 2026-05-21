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
import { DetailEnricher, IncidentService } from '../../application/services';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
    constructor(
        private readonly incidentService: IncidentService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List incidents' })
    @ApiOkResponse({
        description: 'Incidents retrieved successfully',
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
    @ApiBadRequestResponse({ description: 'Invalid incident query parameters' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.incidentService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get incident detail' })
    @ApiOkResponse({
        description: 'Incident retrieved successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiNotFoundResponse({ description: 'Incident not found' })
    async detail(@Param('id') id: string) {
        const incident = await this.incidentService.findById(id);

        if (!incident) {
            throw new NotFoundException('Incident not found');
        }

        return this.detailEnricher.enrich(incident);
    }
}
