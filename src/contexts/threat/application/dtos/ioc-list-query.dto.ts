import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/application/dtos/pagination.dto';
import { SortOrder } from '../../../shared/application/dtos/sort.dto';
import { IocType, TLP, type IocSourceType } from '../../domain';

const IOC_SOURCE_TYPES = ['threat-actor', 'campaign', 'incident'] as const;

export enum IocListSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    VALUE = 'value',
    TYPE = 'type',
}

export interface IocListQuery {
    page: number;
    limit: number;
    type?: IocType;
    value?: string;
    tlp?: TLP;
    sourceType?: IocSourceType;
    sourceId?: string;
    sortBy?: IocListSortBy;
    sortOrder?: SortOrder;
}

export class IocListQueryDto
    extends PaginationQueryDto
    implements IocListQuery
{
    @ApiPropertyOptional({ enum: IocType, enumName: 'IocType' })
    @IsOptional()
    @IsEnum(IocType)
    type?: IocType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    value?: string;

    @ApiPropertyOptional({ enum: TLP, enumName: 'TLP' })
    @IsOptional()
    @IsEnum(TLP)
    tlp?: TLP;

    @ApiPropertyOptional({ enum: IOC_SOURCE_TYPES, enumName: 'IocSourceType' })
    @IsOptional()
    @Type(() => String)
    @IsIn(IOC_SOURCE_TYPES)
    sourceType?: IocSourceType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sourceId?: string;

    @ApiPropertyOptional({
        enum: IocListSortBy,
        enumName: 'IocListSortBy',
        default: IocListSortBy.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(IocListSortBy)
    sortBy: IocListSortBy = IocListSortBy.CREATED_AT;

    @ApiPropertyOptional({
        enum: SortOrder,
        enumName: 'SortOrder',
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: SortOrder = SortOrder.DESC;
}
