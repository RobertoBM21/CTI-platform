import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import { Note, NoteRepository, TLP } from '../../../domain';
import { NoteDoc, NoteDocument } from '../schemas/note.schema';

@Injectable()
export class NoteMongooseRepository extends NoteRepository {
    constructor(
        @InjectModel(NoteDocument.name)
        private readonly noteModel: Model<NoteDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Note | null> {
        const doc = await this.noteModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{ tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};
        const sortQuery = { [sort.field]: sort.direction };

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.noteModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.noteModel.countDocuments(query).exec(),
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

    async create(entity: Note): Promise<Note> {
        const doc = await this.noteModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(id: string, entity: Partial<Note>): Promise<Note | null> {
        const doc = await this.noteModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.noteModel.deleteOne({ domainId: id }).exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: NoteDoc): Note {
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

    private toPersistence(entity: Note): Record<string, unknown> {
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

    private toPersistencePartial(
        entity: Partial<Note>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.content !== undefined) update.content = entity.content;
        if (entity.abstract !== undefined) update.abstract = entity.abstract;
        if (entity.objectRefs !== undefined)
            update.objectRefs = entity.objectRefs;
        if (entity.authors !== undefined) update.authors = entity.authors;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
