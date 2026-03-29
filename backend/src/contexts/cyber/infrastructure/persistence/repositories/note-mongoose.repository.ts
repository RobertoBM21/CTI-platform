import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { Note, NoteRepository, TLP } from '../../../domain';
import { NoteDoc, NoteDocument } from '../schemas/note.schema';

@Injectable()
export class NoteMongooseRepository
    extends BaseMongooseRepository<Note, NoteDoc, Partial<{ tlp: string }>>
    implements NoteRepository
{
    constructor(
        @InjectModel(NoteDocument.name)
        model: Model<NoteDoc>,
    ) {
        super(model);
    }

    protected toDomain(doc: NoteDoc): Note {
        return new Note({
            id: doc.domainId,
            content: doc.content,
            abstract: doc.abstract,
            objectRefs: doc.objectRefs as unknown as string[],
            authors: doc.authors as unknown as string[],
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

    protected toPersistence(entity: Note): Record<string, unknown> {
        return {
            domainId: entity.id,
            content: entity.content,
            abstract: entity.abstract,
            objectRefs: entity.objectRefs,
            authors: entity.authors,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
