import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import {
    Identity,
    IdentityClass,
    IdentityRepository,
    TLP,
} from '../../../domain';
import { IdentityDoc, IdentityDocument } from '../schemas/identity.schema';

@Injectable()
export class IdentityMongooseRepository extends IdentityRepository {
    constructor(
        @InjectModel(IdentityDocument.name)
        private readonly identityModel: Model<IdentityDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Identity | null> {
        const doc = await this.identityModel.findOne({ domainId: id }).exec();
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
            this.identityModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.identityModel.countDocuments(query).exec(),
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

    async findByName(name: string): Promise<Identity | null> {
        const doc = await this.identityModel.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(entity: Identity): Promise<Identity> {
        const doc = await this.identityModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Identity>,
    ): Promise<Identity | null> {
        const doc = await this.identityModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.identityModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: IdentityDoc): Identity {
        return new Identity({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            identityClass: doc.identityClass as IdentityClass | undefined,
            sectors: doc.sectors as unknown as string[],
            contactInformation: doc.contactInformation,
            roles: doc.roles as unknown as string[],
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

    private toPersistence(entity: Identity): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            identityClass: entity.identityClass,
            sectors: entity.sectors,
            contactInformation: entity.contactInformation,
            roles: entity.roles,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Identity>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.identityClass !== undefined)
            update.identityClass = entity.identityClass;
        if (entity.sectors !== undefined) update.sectors = entity.sectors;
        if (entity.contactInformation !== undefined)
            update.contactInformation = entity.contactInformation;
        if (entity.roles !== undefined) update.roles = entity.roles;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
