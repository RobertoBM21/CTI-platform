import { Model, QueryFilter, UpdateQuery } from 'mongoose';
import { PaginatedResponse } from '../../application/dtos/pagination.dto';
import { SortCriteria } from '../../application/dtos/sort.dto';

export abstract class BaseMongooseRepository<
    Entity,
    Doc extends { domainId: string },
    Filter = Partial<{ name: string; tlp: string }>,
> {
    protected readonly regexFields: ReadonlySet<string> = new Set(['name']);

    constructor(protected readonly model: Model<Doc>) {}

    protected abstract toDomain(doc: Doc): Entity;
    protected abstract toPersistence(entity: Entity): Record<string, unknown>;

    async findById(id: string): Promise<Entity | null> {
        const doc = await this.model
            .findOne({ domainId: id } as QueryFilter<Doc>)
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Filter,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Entity>> {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query = this.buildQueryFilter(filter as Record<string, unknown>);
        const sortQuery = { [sort.field]: sort.direction };

        const [docs, total] = await Promise.all([
            this.model
                .find(query as QueryFilter<Doc>)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.model.countDocuments(query as QueryFilter<Doc>).exec(),
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

    async save(entity: Entity): Promise<Entity> {
        const data = this.toPersistence(entity);
        const { domainId, createdAt, ...mutableFields } = data as Record<
            string,
            unknown
        > & { domainId: string; createdAt: unknown };
        const filter = { domainId } as QueryFilter<Doc>;
        const update = {
            $set: mutableFields,
            $setOnInsert: { domainId, createdAt },
        } as unknown as UpdateQuery<Doc>;

        const doc = await this.model
            .findOneAndUpdate(filter, update, {
                upsert: true,
                returnDocument: 'after',
                timestamps: false,
            })
            .exec();

        return this.toDomain(doc);
    }

    async update(id: string, entity: Partial<Entity>): Promise<Entity | null> {
        const doc = await this.model
            .findOneAndUpdate(
                { domainId: id } as QueryFilter<Doc>,
                this.toPersistencePartial(entity),
                { returnDocument: 'after' },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model
            .deleteOne({ domainId: id } as QueryFilter<Doc>)
            .exec();
        return result.deletedCount > 0;
    }

    protected toPersistencePartial(
        entity: Partial<Entity>,
    ): Record<string, unknown> {
        const full = this.toPersistence(entity as Entity);
        delete full.domainId;
        delete full.createdAt;
        delete full.updatedAt;
        return {
            ...Object.fromEntries(
                Object.entries(full).filter(([, v]) => v !== undefined),
            ),
            updatedAt: new Date(),
        };
    }

    protected buildQueryFilter(
        filter: Record<string, unknown>,
    ): Record<string, unknown> {
        const query: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(filter)) {
            if (value === undefined || value === null) continue;

            if (key === 'ids' && Array.isArray(value)) {
                query.domainId = { $in: value };
            } else {
                query[key] = this.regexFields.has(key)
                    ? { $regex: value, $options: 'i' }
                    : value;
            }
        }

        return query;
    }
}
