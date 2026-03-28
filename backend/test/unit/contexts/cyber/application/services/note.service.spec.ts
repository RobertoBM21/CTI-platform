import { NoteService } from '../../../../../../src/contexts/cyber/application/services/note.service';
import {
    Note,
    NoteRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('NoteService', () => {
    it('should delegate findById to note repository', async () => {
        const note = new Note({ id: 'note--n1', content: 'Test note content' });
        const repository: Pick<NoteRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(note),
        };

        const service = new NoteService(repository as NoteRepository);
        const result = await service.findById('note--n1');

        expect(repository.findById).toHaveBeenCalledWith('note--n1');
        expect(result?.id).toBe('note--n1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<NoteRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new NoteService(repository as NoteRepository);
        const result = await service.findById('note--missing');

        expect(result).toBeNull();
    });
});
