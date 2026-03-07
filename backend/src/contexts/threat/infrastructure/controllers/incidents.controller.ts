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
    GetIncidentDetailUseCase,
    ListIncidentsUseCase,
} from '../../application/use-cases';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
    constructor(
        private readonly listIncidentsUseCase: ListIncidentsUseCase,
        private readonly getIncidentDetailUseCase: GetIncidentDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List incidents' })
    @ApiOkResponse({ description: 'Incidents retrieved successfully' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.listIncidentsUseCase.execute(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get incident detail' })
    @ApiOkResponse({ description: 'Incident retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Incident not found' })
    async detail(@Param('id') id: string) {
        const incident = await this.getIncidentDetailUseCase.execute({ id });

        if (!incident) {
            throw new NotFoundException('Incident not found');
        }

        return incident;
    }
}
