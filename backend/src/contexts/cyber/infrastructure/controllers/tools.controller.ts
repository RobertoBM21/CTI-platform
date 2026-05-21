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
import { ToolCatalogQueryDto } from '../../application/dtos';
import { ToolService } from '../../application/services';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
    constructor(
        private readonly toolService: ToolService,
        private readonly detailEnricher: DetailEnricher,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List tools' })
    @ApiOkResponse({
        description: 'Tools retrieved successfully',
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
    @ApiBadRequestResponse({ description: 'Invalid tool query parameters' })
    list(@Query() query: ToolCatalogQueryDto) {
        return this.toolService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get tool detail' })
    @ApiOkResponse({
        description: 'Tool retrieved successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiNotFoundResponse({ description: 'Tool not found' })
    async detail(@Param('id') id: string) {
        const tool = await this.toolService.findById(id);

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        return this.detailEnricher.enrich(tool);
    }
}
