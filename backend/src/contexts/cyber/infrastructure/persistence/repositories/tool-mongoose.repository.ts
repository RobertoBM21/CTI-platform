import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { TLP, Tool, ToolRepository, ToolType } from '../../../domain';
import { ToolDoc, ToolDocument } from '../schemas/tool.schema';

@Injectable()
export class ToolMongooseRepository
    extends BaseMongooseRepository<Tool, ToolDoc>
    implements ToolRepository
{
    constructor(@InjectModel(ToolDocument.name) model: Model<ToolDoc>) {
        super(model);
    }

    async findByName(name: string): Promise<Tool | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: ToolDoc): Tool {
        return new Tool({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            toolTypes: doc.toolTypes as unknown as ToolType[],
            killChainPhases: doc.killChainPhases.map((p) => ({
                killChainName: p.killChainName,
                phaseName: p.phaseName,
            })),
            toolVersion: doc.toolVersion,
            aliases: doc.aliases as unknown as string[],
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

    protected toPersistence(entity: Tool): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            toolTypes: entity.toolTypes,
            killChainPhases: entity.killChainPhases,
            toolVersion: entity.toolVersion,
            aliases: entity.aliases,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
