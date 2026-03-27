import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import { AttackPattern, AttackPatternRepository, TLP } from '../../../domain';
import {
    AttackPatternDoc,
    AttackPatternDocument,
} from '../schemas/attack-pattern.schema';

@Injectable()
export class AttackPatternMongooseRepository extends AttackPatternRepository {
    constructor(
        @InjectModel(AttackPatternDocument.name)
        private readonly attackPatternModel: Model<AttackPatternDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<AttackPattern | null> {
        const doc = await this.attackPatternModel
            .findOne({ domainId: id })
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};
        const sortQuery = { [sort.field]: sort.direction };

        if (filter.name) {
            query.name = { $regex: filter.name, $options: 'i' };
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.attackPatternModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.attackPatternModel.countDocuments(query).exec(),
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

    async findByExternalReference(ref: string): Promise<AttackPattern | null> {
        const doc = await this.attackPatternModel
            .findOne({ externalReference: ref })
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(entity: AttackPattern): Promise<AttackPattern> {
        const doc = await this.attackPatternModel.create(
            this.toPersistence(entity),
        );
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<AttackPattern>,
    ): Promise<AttackPattern | null> {
        const doc = await this.attackPatternModel
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
        const result = await this.attackPatternModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: AttackPatternDoc): AttackPattern {
        return new AttackPattern({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            aliases: doc.aliases as unknown as string[],
            externalReference: doc.externalReference,
            killChainPhase: doc.killChainPhase,
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

    private toPersistence(entity: AttackPattern): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            aliases: entity.aliases,
            externalReference: entity.externalReference,
            killChainPhase: entity.killChainPhase,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<AttackPattern>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.aliases !== undefined) update.aliases = entity.aliases;
        if (entity.externalReference !== undefined)
            update.externalReference = entity.externalReference;
        if (entity.killChainPhase !== undefined)
            update.killChainPhase = entity.killChainPhase;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
