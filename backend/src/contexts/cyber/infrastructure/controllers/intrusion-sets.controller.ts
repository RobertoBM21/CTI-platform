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
import { IntrusionSetCatalogQueryDto } from '../../application/dtos';
import { IntrusionSetService } from '../../application/services';

@ApiTags('Intrusion Sets')
@Controller('intrusion-sets')
export class IntrusionSetsController {
    constructor(private readonly intrusionSetService: IntrusionSetService) {}

    @Get()
    @ApiOperation({ summary: 'List intrusion sets' })
    @ApiOkResponse({ description: 'Intrusion sets retrieved successfully' })
    list(@Query() query: IntrusionSetCatalogQueryDto) {
        return this.intrusionSetService.list(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get intrusion set detail' })
    @ApiOkResponse({ description: 'Intrusion set retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Intrusion set not found' })
    async detail(@Param('id') id: string) {
        const intrusionSet = await this.intrusionSetService.findById(id);

        if (!intrusionSet) {
            throw new NotFoundException('Intrusion set not found');
        }

        return intrusionSet;
    }
}
