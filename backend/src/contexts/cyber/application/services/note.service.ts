import { Injectable } from '@nestjs/common';
import { Note, NoteRepository } from '../../domain';

@Injectable()
export class NoteService {
    constructor(private readonly noteRepository: NoteRepository) {}

    findById(id: string): Promise<Note | null> {
        return this.noteRepository.findById(id);
    }

    save(entity: Note): Promise<Note> {
        return this.noteRepository.save(entity);
    }
}
