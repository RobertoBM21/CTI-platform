import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import {
    AttackMotivation,
    Campaign,
    CampaignRepository,
    TLP,
} from '../../../domain';
import { CampaignDoc, CampaignDocument } from '../schemas/campaign.schema';

@Injectable()
export class CampaignMongooseRepository
    extends BaseMongooseRepository<Campaign, CampaignDoc>
    implements CampaignRepository
{
    constructor(@InjectModel(CampaignDocument.name) model: Model<CampaignDoc>) {
        super(model);
    }

    protected toDomain(doc: CampaignDoc): Campaign {
        return new Campaign({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            aliases: doc.aliases as unknown as string[],
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            objective: doc.objective,
            primaryMotivations:
                doc.primaryMotivations as unknown as AttackMotivation[],
            secondaryMotivations:
                doc.secondaryMotivations as unknown as AttackMotivation[],
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

    protected toPersistence(entity: Campaign): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            aliases: entity.aliases,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            objective: entity.objective,
            primaryMotivations: entity.primaryMotivations,
            secondaryMotivations: entity.secondaryMotivations,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
