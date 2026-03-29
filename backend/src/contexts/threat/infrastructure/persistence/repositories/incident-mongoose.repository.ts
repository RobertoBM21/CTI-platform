import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { Incident, IncidentRepository, TLP } from '../../../domain';
import { IncidentDoc, IncidentDocument } from '../schemas/incident.schema';

@Injectable()
export class IncidentMongooseRepository
    extends BaseMongooseRepository<Incident, IncidentDoc>
    implements IncidentRepository
{
    constructor(@InjectModel(IncidentDocument.name) model: Model<IncidentDoc>) {
        super(model);
    }

    protected toDomain(doc: IncidentDoc): Incident {
        return new Incident({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            objective: doc.objective,
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

    protected toPersistence(entity: Incident): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            objective: entity.objective,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
