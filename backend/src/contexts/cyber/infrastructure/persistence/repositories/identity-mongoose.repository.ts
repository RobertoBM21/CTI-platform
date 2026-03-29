import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import {
    Identity,
    IdentityClass,
    IdentityRepository,
    TLP,
} from '../../../domain';
import { IdentityDoc, IdentityDocument } from '../schemas/identity.schema';

@Injectable()
export class IdentityMongooseRepository
    extends BaseMongooseRepository<Identity, IdentityDoc>
    implements IdentityRepository
{
    constructor(@InjectModel(IdentityDocument.name) model: Model<IdentityDoc>) {
        super(model);
    }

    async findByName(name: string): Promise<Identity | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: IdentityDoc): Identity {
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

    protected toPersistence(entity: Identity): Record<string, unknown> {
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
}
