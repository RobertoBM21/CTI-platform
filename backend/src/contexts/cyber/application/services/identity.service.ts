import { Injectable } from '@nestjs/common';
import { Identity, IdentityRepository } from '../../domain';

@Injectable()
export class IdentityService {
    constructor(private readonly identityRepository: IdentityRepository) {}

    findById(id: string): Promise<Identity | null> {
        return this.identityRepository.findById(id);
    }
}
