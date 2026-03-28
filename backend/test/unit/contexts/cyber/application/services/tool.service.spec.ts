import { ToolService } from '../../../../../../src/contexts/cyber/application/services/tool.service';
import {
    Tool,
    ToolRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('ToolService', () => {
    it('should delegate findById to tool repository', async () => {
        const tool = new Tool({ id: 'tool--t1', name: 'Mimikatz' });
        const repository: Pick<ToolRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(tool),
        };

        const service = new ToolService(repository as ToolRepository);
        const result = await service.findById('tool--t1');

        expect(repository.findById).toHaveBeenCalledWith('tool--t1');
        expect(result?.id).toBe('tool--t1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<ToolRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new ToolService(repository as ToolRepository);
        const result = await service.findById('tool--missing');

        expect(result).toBeNull();
    });
});
