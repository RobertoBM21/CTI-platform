import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Note } from '../entities/note.entity';

export abstract class NoteRepository {
    abstract findById(id: string): Promise<Note | null>;

    abstract findAll(
        filter: Partial<{ tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Note>>;

    abstract save(entity: Note): Promise<Note>;

    abstract update(id: string, entity: Partial<Note>): Promise<Note | null>;

    abstract delete(id: string): Promise<boolean>;
}
