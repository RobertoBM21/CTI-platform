import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sighting, SightingRepository, TLP } from '../../../domain';
import { BaseMongooseRepository } from '../base-mongoose.repository';
import { SightingDoc, SightingDocument } from '../schemas/sighting.schema';

type SightingFilter = Partial<{
    sightingOfRef: string;
    tlp: string;
}>;

@Injectable()
export class SightingMongooseRepository
    extends BaseMongooseRepository<Sighting, SightingDoc, SightingFilter>
    implements SightingRepository
{
    constructor(
        @InjectModel(SightingDocument.name)
        model: Model<SightingDoc>,
    ) {
        super(model);
    }

    async findBySightingOfRef(sightingOfRef: string): Promise<Sighting[]> {
        const docs = await this.model.find({ sightingOfRef }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    protected toDomain(doc: SightingDoc): Sighting {
        return new Sighting({
            id: doc.domainId,
            description: doc.description,
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            count: doc.count,
            sightingOfRef: doc.sightingOfRef,
            observedDataRefs: doc.observedDataRefs as unknown as string[],
            whereSightedRefs: doc.whereSightedRefs as unknown as string[],
            tlp: doc.tlp as TLP,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    protected toPersistence(entity: Sighting): Record<string, unknown> {
        return {
            domainId: entity.id,
            description: entity.description,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            count: entity.count,
            sightingOfRef: entity.sightingOfRef,
            observedDataRefs: entity.observedDataRefs,
            whereSightedRefs: entity.whereSightedRefs,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
