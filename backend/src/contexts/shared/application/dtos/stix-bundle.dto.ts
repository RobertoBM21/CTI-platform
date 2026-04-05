import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, Equals, IsArray, IsString } from 'class-validator';

export class StixBundleDto {
    @ApiProperty({ example: 'bundle' })
    @Equals('bundle')
    type!: string;

    @ApiProperty({ example: 'bundle--601cee35-6b16-4e68-a3e7-9ec7d755b4c3' })
    @IsString()
    id!: string;

    @ApiProperty({ type: [Object], isArray: true })
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Object)
    objects!: Record<string, unknown>[];
}

export interface IngestionSummary {
    total: number;
    processed: number;
    skipped: number;
    failed: number;
}
