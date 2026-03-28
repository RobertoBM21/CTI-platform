import { CourseOfActionService } from '../../../../../../src/contexts/cyber/application/services/course-of-action.service';
import {
    CourseOfAction,
    CourseOfActionRepository,
} from '../../../../../../src/contexts/cyber/domain';

describe('CourseOfActionService', () => {
    it('should delegate findById to course of action repository', async () => {
        const coa = new CourseOfAction({
            id: 'course-of-action--c1',
            name: 'Block IP',
        });
        const repository: Pick<CourseOfActionRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(coa),
        };

        const service = new CourseOfActionService(
            repository as CourseOfActionRepository,
        );
        const result = await service.findById('course-of-action--c1');

        expect(repository.findById).toHaveBeenCalledWith(
            'course-of-action--c1',
        );
        expect(result?.id).toBe('course-of-action--c1');
    });

    it('should return null when not found', async () => {
        const repository: Pick<CourseOfActionRepository, 'findById'> = {
            findById: jest.fn().mockResolvedValue(null),
        };

        const service = new CourseOfActionService(
            repository as CourseOfActionRepository,
        );
        const result = await service.findById('course-of-action--missing');

        expect(result).toBeNull();
    });
});
