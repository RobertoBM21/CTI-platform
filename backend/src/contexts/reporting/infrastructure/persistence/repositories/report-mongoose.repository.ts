import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { Report, ReportRepository } from '../../../domain';
import { ReportType } from '../../../domain/value-objects/report-type.vo';
import { ReportDoc, ReportDocument } from '../schemas/report.schema';

@Injectable()
export class ReportMongooseRepository
    extends BaseMongooseRepository<Report, ReportDoc>
    implements ReportRepository
{
    constructor(@InjectModel(ReportDocument.name) model: Model<ReportDoc>) {
        super(model);
    }

    protected toDomain(doc: ReportDoc): Report {
        return new Report({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            reportTypes: doc.reportTypes as unknown as ReportType[],
            published: doc.published,
            objectRefs: doc.objectRefs as unknown as string[],
            confidence: doc.confidence,
            revoked: doc.revoked,
            externalReferences: doc.externalReferences.map((r) => ({
                sourceName: r.sourceName,
                ...(r.description != null && { description: r.description }),
                ...(r.externalId != null && { externalId: r.externalId }),
                ...(r.url != null && { url: r.url }),
            })),
            tlp: doc.tlp as TLP,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    protected toPersistence(entity: Report): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            reportTypes: entity.reportTypes,
            published: entity.published,
            objectRefs: entity.objectRefs,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
