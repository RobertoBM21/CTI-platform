import { Controller, Get, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { LocationCatalogQueryDto } from '../../application/dtos';
import { LocationService } from '../../application/services';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
    constructor(private readonly locationService: LocationService) {}

    @Get()
    @ApiOperation({ summary: 'List locations' })
    @ApiOkResponse({
        description: 'Locations retrieved successfully',
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
    @ApiBadRequestResponse({ description: 'Invalid location query parameters' })
    list(@Query() query: LocationCatalogQueryDto) {
        return this.locationService.list(query);
    }
}
