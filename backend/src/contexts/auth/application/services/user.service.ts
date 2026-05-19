import { Injectable } from '@nestjs/common';
import { User, UserRepository } from '../../domain';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    findById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findByGoogleId(googleId);
    }

    save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }
}
