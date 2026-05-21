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
import { DetailEnricher } from '../../../threat/application/services';
import { IntrusionSetCatalogQueryDto } from '../../application/dtos';
import { IntrusionSetService } from '../../application/services';

@ApiTags('Intrusion Sets')
@Controller('intrusion-sets')
export class IntrusionSetsController {
    constructor(
        private readonly intrusionSetService: IntrusionSetService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List intrusion sets' })
    @ApiOkResponse({
        description: 'Intrusion sets retrieved successfully',
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
        description: 'Invalid intrusion set query parameters',
    })
    list(@Query() query: IntrusionSetCatalogQueryDto) {
        return this.intrusionSetService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get intrusion set detail' })
    @ApiOkResponse({
        description: 'Intrusion set retrieved successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiNotFoundResponse({ description: 'Intrusion set not found' })
    async detail(@Param('id') id: string) {
        const intrusionSet = await this.intrusionSetService.findById(id);

        if (!intrusionSet) {
            throw new NotFoundException('Intrusion set not found');
        }

        return this.detailEnricher.enrich(intrusionSet);
    }
}
