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
    AttackPatternService,
    DetailEnricher,
} from '../../application/services';

@ApiTags('Attack Patterns')
@Controller('attack-patterns')
export class AttackPatternsController {
    constructor(
        private readonly attackPatternService: AttackPatternService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List attack patterns' })
    @ApiOkResponse({ description: 'Attack patterns retrieved successfully' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.attackPatternService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get attack pattern detail' })
    @ApiOkResponse({ description: 'Attack pattern retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Attack pattern not found' })
    async detail(@Param('id') id: string) {
        const attackPattern = await this.attackPatternService.findById(id);

        if (!attackPattern) {
            throw new NotFoundException('Attack pattern not found');
        }

        return this.detailEnricher.enrich(attackPattern);
    }
}
