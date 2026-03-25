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
import { IncidentService } from '../../application/services';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentService: IncidentService) {}

    @Get()
    @ApiOperation({ summary: 'List incidents' })
    @ApiOkResponse({ description: 'Incidents retrieved successfully' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.incidentService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get incident detail' })
    @ApiOkResponse({ description: 'Incident retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Incident not found' })
    async detail(@Param('id') id: string) {
        const incident = await this.incidentService.findById(id);

        if (!incident) {
            throw new NotFoundException('Incident not found');
        }

        return incident;
    }
}
