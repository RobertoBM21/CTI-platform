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
import { DetailEnricher } from '../../../threat/application/services/detail-enricher.service';
import { StixRefResolver } from '../../../threat/application/services/stix-ref-resolver.service';
import { ReportCatalogQueryDto } from '../../application/dtos/report-catalog-query.dto';
import { ReportService } from '../../application/services/report.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportService: ReportService,
        private readonly detailEnricher: DetailEnricher,
        private readonly stixRefResolver: StixRefResolver,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List intelligence reports' })
    @ApiOkResponse({ description: 'Reports retrieved successfully' })
    list(@Query() query: ReportCatalogQueryDto) {
        return this.reportService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get report detail with referenced objects' })
    @ApiOkResponse({ description: 'Report retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Report not found' })
    async detail(@Param('id') id: string) {
        const report = await this.reportService.findById(id);

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        const [enriched, resolvedRefs] = await Promise.all([
            this.detailEnricher.enrich(report),
            Promise.all(
                report.objectRefs.map((ref) =>
                    this.stixRefResolver.resolve(ref),
                ),
            ),
        ]);

        return {
            ...enriched,
            objectRefs: resolvedRefs.filter(Boolean),
        };
    }
}
