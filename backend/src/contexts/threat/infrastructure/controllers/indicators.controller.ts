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
import { IndicatorListQueryDto } from '../../application/dtos';
import { DetailEnricher, IndicatorService } from '../../application/services';

@ApiTags('Indicators')
@Controller('indicators')
export class IndicatorsController {
    constructor(
        private readonly indicatorService: IndicatorService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List indicators' })
    @ApiOkResponse({ description: 'Indicators retrieved successfully' })
    list(@Query() query: IndicatorListQueryDto) {
        return this.indicatorService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get indicator detail' })
    @ApiOkResponse({ description: 'Indicator retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Indicator not found' })
    async detail(@Param('id') id: string) {
        const indicator = await this.indicatorService.findById(id);

        if (!indicator) {
            throw new NotFoundException('Indicator not found');
        }

        return this.detailEnricher.enrich(indicator);
    }
}
