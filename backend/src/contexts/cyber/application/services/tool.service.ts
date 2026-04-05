import { Injectable } from '@nestjs/common';
import { Tool, ToolRepository } from '../../domain';

@Injectable()
export class ToolService {
    constructor(private readonly toolRepository: ToolRepository) {}

    findById(id: string): Promise<Tool | null> {
        return this.toolRepository.findById(id);
    }

    save(entity: Tool): Promise<Tool> {
        return this.toolRepository.save(entity);
    }
}
