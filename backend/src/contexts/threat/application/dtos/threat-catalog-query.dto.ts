import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/application/dtos/pagination.dto';
import { SortOrder } from '../../../shared/application/dtos/sort.dto';
import { TLP } from '../../domain';

export enum ThreatCatalogSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    NAME = 'name',
}

export interface ThreatCatalogQuery {
    page: number;
    limit: number;
    name?: string;
    tlp?: TLP;
    sortBy?: ThreatCatalogSortBy;
    sortOrder?: SortOrder;
    attackPatternId?: string;
    intrusionSetId?: string;
}

export class ThreatCatalogQueryDto
    extends PaginationQueryDto
    implements ThreatCatalogQuery
{
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: TLP, enumName: 'TLP' })
    @IsOptional()
    @IsEnum(TLP)
    tlp?: TLP;

    @ApiPropertyOptional({
        enum: ThreatCatalogSortBy,
        enumName: 'ThreatCatalogSortBy',
        default: ThreatCatalogSortBy.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(ThreatCatalogSortBy)
    sortBy: ThreatCatalogSortBy = ThreatCatalogSortBy.CREATED_AT;

    @ApiPropertyOptional({
        enum: SortOrder,
        enumName: 'SortOrder',
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({
        description: 'Filter by related Attack Pattern ID (STIX)',
    })
    @IsOptional()
    @IsString()
    attackPatternId?: string;

    @ApiPropertyOptional({
        description: 'Filter by related Intrusion Set ID (STIX)',
    })
    @IsOptional()
    @IsString()
    intrusionSetId?: string;
}
