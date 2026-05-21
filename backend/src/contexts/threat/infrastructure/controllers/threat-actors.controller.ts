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
import { DetailEnricher, ThreatActorService } from '../../application/services';

@ApiTags('Threat Actors')
@Controller('threat-actors')
export class ThreatActorsController {
    constructor(
        private readonly threatActorService: ThreatActorService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List threat actors' })
    @ApiOkResponse({
        description: 'Threat actors retrieved successfully',
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
    @ApiBadRequestResponse({
        description: 'Invalid threat actor query parameters',
    })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.threatActorService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get threat actor detail' })
    @ApiOkResponse({
        description: 'Threat actor retrieved successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiNotFoundResponse({ description: 'Threat actor not found' })
    async detail(@Param('id') id: string) {
        const threatActor = await this.threatActorService.findById(id);

        if (!threatActor) {
            throw new NotFoundException('Threat actor not found');
        }

        return this.detailEnricher.enrich(threatActor);
    }
}
