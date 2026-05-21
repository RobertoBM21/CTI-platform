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
import { VulnerabilityCatalogQueryDto } from '../../application/dtos';
import { VulnerabilityService } from '../../application/services';

@ApiTags('Vulnerabilities')
@Controller('vulnerabilities')
export class VulnerabilitiesController {
    constructor(
        private readonly vulnerabilityService: VulnerabilityService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List vulnerabilities' })
    @ApiOkResponse({
        description: 'Vulnerabilities retrieved successfully',
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
        description: 'Invalid vulnerability query parameters',
    })
    list(@Query() query: VulnerabilityCatalogQueryDto) {
        return this.vulnerabilityService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get vulnerability detail' })
    @ApiOkResponse({
        description: 'Vulnerability retrieved successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiNotFoundResponse({ description: 'Vulnerability not found' })
    async detail(@Param('id') id: string) {
        const vulnerability = await this.vulnerabilityService.findById(id);

        if (!vulnerability) {
            throw new NotFoundException('Vulnerability not found');
        }

        return this.detailEnricher.enrich(vulnerability);
    }
}
