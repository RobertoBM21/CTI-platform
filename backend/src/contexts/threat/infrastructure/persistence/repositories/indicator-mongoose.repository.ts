import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import {
    Indicator,
    IndicatorRepository,
    IndicatorType,
    IocType,
    PatternType,
    TLP,
} from '../../../domain';
import { IndicatorDoc, IndicatorDocument } from '../schemas/indicator.schema';

type IndicatorFilter = Partial<{
    type: string;
    value: string;
    name: string;
    tlp: string;
}>;

@Injectable()
export class IndicatorMongooseRepository
    extends BaseMongooseRepository<Indicator, IndicatorDoc, IndicatorFilter>
    implements IndicatorRepository
{
    protected override readonly regexFields = new Set(['name', 'value']);

    constructor(
        @InjectModel(IndicatorDocument.name) model: Model<IndicatorDoc>,
    ) {
        super(model);
    }

    async findByValue(value: string): Promise<Indicator[]> {
        const docs = await this.model
            .find({ value })
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    protected toDomain(doc: IndicatorDoc): Indicator {
        return new Indicator({
            id: doc.domainId,
            name: doc.name,
            type: doc.type as IocType,
            value: doc.value,
            description: doc.description,
            indicatorTypes: doc.indicatorTypes as unknown as IndicatorType[],
            pattern: doc.pattern,
            patternType: doc.patternType as PatternType | undefined,
            patternVersion: doc.patternVersion,
            validFrom: doc.validFrom,
            validUntil: doc.validUntil,
            killChainPhases: doc.killChainPhases.map((p) => ({
                killChainName: p.killChainName,
                phaseName: p.phaseName,
            })),
            tags: doc.tags as unknown as string[],
            confidence: doc.confidence,
            revoked: doc.revoked,
            externalReferences: doc.externalReferences.map((r) => ({
                sourceName: r.sourceName,
                ...(r.description != null && {
                    description: r.description,
                }),
                ...(r.externalId != null && {
                    externalId: r.externalId,
                }),
                ...(r.url != null && { url: r.url }),
            })),
            tlp: doc.tlp as TLP,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    protected toPersistence(entity: Indicator): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            type: entity.type,
            value: entity.value,
            description: entity.description,
            indicatorTypes: entity.indicatorTypes,
            pattern: entity.pattern,
            patternType: entity.patternType,
            patternVersion: entity.patternVersion,
            validFrom: entity.validFrom,
            validUntil: entity.validUntil,
            killChainPhases: entity.killChainPhases,
            tags: entity.tags,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
