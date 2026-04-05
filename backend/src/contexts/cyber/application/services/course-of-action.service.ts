import { Injectable } from '@nestjs/common';
import { CourseOfAction, CourseOfActionRepository } from '../../domain';

@Injectable()
export class CourseOfActionService {
    constructor(
        private readonly courseOfActionRepository: CourseOfActionRepository,
    ) {}

    findById(id: string): Promise<CourseOfAction | null> {
        return this.courseOfActionRepository.findById(id);
    }

    save(entity: CourseOfAction): Promise<CourseOfAction> {
        return this.courseOfActionRepository.save(entity);
    }
}
