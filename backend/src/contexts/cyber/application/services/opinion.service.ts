import { Injectable } from '@nestjs/common';
import { Opinion, OpinionRepository } from '../../domain';

@Injectable()
export class OpinionService {
    constructor(private readonly opinionRepository: OpinionRepository) {}

    findById(id: string): Promise<Opinion | null> {
        return this.opinionRepository.findById(id);
    }
}
