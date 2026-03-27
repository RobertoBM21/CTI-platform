import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import {
    Indicator,
    IndicatorRepository,
    IndicatorType,
    IocType,
    PatternType,
    TLP,
} from '../../../domain';
import { IndicatorDoc, IndicatorDocument } from '../schemas/indicator.schema';

@Injectable()
export class IndicatorMongooseRepository extends IndicatorRepository {
    constructor(
        @InjectModel(IndicatorDocument.name)
        private readonly indicatorModel: Model<IndicatorDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Indicator | null> {
        const doc = await this.indicatorModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{
            type: string;
            value: string;
            name: string;
            tlp: string;
        }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};
        const sortQuery = { [sort.field]: sort.direction };

        if (filter.type) {
            query.type = filter.type;
        }

        if (filter.value) {
            query.value = { $regex: filter.value, $options: 'i' };
        }

        if (filter.name) {
            query.name = { $regex: filter.name, $options: 'i' };
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.indicatorModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.indicatorModel.countDocuments(query).exec(),
        ]);

        return {
            data: docs.map((doc) => this.toDomain(doc)),
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    }

    async findByValue(value: string): Promise<Indicator[]> {
        const docs = await this.indicatorModel
            .find({ value })
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async create(entity: Indicator): Promise<Indicator> {
        const doc = await this.indicatorModel.create(
            this.toPersistence(entity),
        );
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Indicator>,
    ): Promise<Indicator | null> {
        const doc = await this.indicatorModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                {
                    new: true,
                },
            )
            .exec();

        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.indicatorModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: IndicatorDoc): Indicator {
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

    private toPersistence(entity: Indicator): Record<string, unknown> {
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

    private toPersistencePartial(
        entity: Partial<Indicator>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.type !== undefined) update.type = entity.type;
        if (entity.value !== undefined) update.value = entity.value;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.indicatorTypes !== undefined)
            update.indicatorTypes = entity.indicatorTypes;
        if (entity.pattern !== undefined) update.pattern = entity.pattern;
        if (entity.patternType !== undefined)
            update.patternType = entity.patternType;
        if (entity.patternVersion !== undefined)
            update.patternVersion = entity.patternVersion;
        if (entity.validFrom !== undefined) update.validFrom = entity.validFrom;
        if (entity.validUntil !== undefined)
            update.validUntil = entity.validUntil;
        if (entity.killChainPhases !== undefined)
            update.killChainPhases = entity.killChainPhases;
        if (entity.tags !== undefined) update.tags = entity.tags;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
