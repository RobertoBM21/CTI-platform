import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import {
    AttackMotivation,
    ResourceLevel,
    ThreatActor,
    ThreatActorRepository,
    ThreatActorRole,
    ThreatActorSophistication,
    ThreatActorType,
    TLP,
} from '../../../domain';
import {
    ThreatActorDoc,
    ThreatActorDocument,
} from '../schemas/threat-actor.schema';

@Injectable()
export class ThreatActorMongooseRepository extends ThreatActorRepository {
    constructor(
        @InjectModel(ThreatActorDocument.name)
        private readonly threatActorModel: Model<ThreatActorDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<ThreatActor | null> {
        const doc = await this.threatActorModel
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
            this.threatActorModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.threatActorModel.countDocuments(query).exec(),
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

    async findByName(name: string): Promise<ThreatActor | null> {
        const doc = await this.threatActorModel.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(entity: ThreatActor): Promise<ThreatActor> {
        const doc = await this.threatActorModel.create(
            this.toPersistence(entity),
        );
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<ThreatActor>,
    ): Promise<ThreatActor | null> {
        const doc = await this.threatActorModel
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
        const result = await this.threatActorModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: ThreatActorDoc): ThreatActor {
        return new ThreatActor({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            threatActorTypes:
                doc.threatActorTypes as unknown as ThreatActorType[],
            aliases: doc.aliases as unknown as string[],
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            roles: doc.roles as unknown as ThreatActorRole[],
            goals: doc.goals,
            sophistication: doc.sophistication as
                | ThreatActorSophistication
                | undefined,
            resourceLevel: doc.resourceLevel as ResourceLevel | undefined,
            primaryMotivations:
                doc.primaryMotivations as unknown as AttackMotivation[],
            secondaryMotivations:
                doc.secondaryMotivations as unknown as AttackMotivation[],
            personalMotivations: doc.personalMotivations,
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

    private toPersistence(entity: ThreatActor): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            threatActorTypes: entity.threatActorTypes,
            aliases: entity.aliases,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            roles: entity.roles,
            goals: entity.goals,
            sophistication: entity.sophistication,
            resourceLevel: entity.resourceLevel,
            primaryMotivations: entity.primaryMotivations,
            secondaryMotivations: entity.secondaryMotivations,
            personalMotivations: entity.personalMotivations,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<ThreatActor>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.threatActorTypes !== undefined)
            update.threatActorTypes = entity.threatActorTypes;
        if (entity.aliases !== undefined) update.aliases = entity.aliases;
        if (entity.firstSeen !== undefined) update.firstSeen = entity.firstSeen;
        if (entity.lastSeen !== undefined) update.lastSeen = entity.lastSeen;
        if (entity.roles !== undefined) update.roles = entity.roles;
        if (entity.goals !== undefined) update.goals = entity.goals;
        if (entity.sophistication !== undefined)
            update.sophistication = entity.sophistication;
        if (entity.resourceLevel !== undefined)
            update.resourceLevel = entity.resourceLevel;
        if (entity.primaryMotivations !== undefined)
            update.primaryMotivations = entity.primaryMotivations;
        if (entity.secondaryMotivations !== undefined)
            update.secondaryMotivations = entity.secondaryMotivations;
        if (entity.personalMotivations !== undefined)
            update.personalMotivations = entity.personalMotivations;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
