import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../domain';
import { UserService } from './user.service';

export interface JwtPayload {
    sub: string;
    email: string;
}

export interface AuthTokenResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export interface GoogleProfile {
    id: string;
    displayName: string;
    emails: { value: string }[];
}

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateLocalUser(
        email: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.userService.findByEmail(email);
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        return valid ? user : null;
    }

    async register(
        email: string,
        password: string,
        name: string,
    ): Promise<AuthTokenResponse> {
        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const user = await this.userService.save(
            new User({ email, passwordHash, name }),
        );
        return this.buildTokenResponse(user);
    }

    async findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
        const existing = await this.userService.findByGoogleId(profile.id);
        if (existing) return existing;

        const email = profile.emails[0]?.value ?? '';
        const byEmail = await this.userService.findByEmail(email);
        if (byEmail) {
            // Link Google account to existing email user
            const updated = new User({
                id: byEmail.id,
                email: byEmail.email,
                passwordHash: byEmail.passwordHash,
                googleId: profile.id,
                name: byEmail.name || profile.displayName,
                createdAt: byEmail.createdAt,
                updatedAt: byEmail.updatedAt,
            });
            return this.userService.save(updated);
        }

        return this.userService.save(
            new User({
                email,
                googleId: profile.id,
                name: profile.displayName,
            }),
        );
    }

    buildTokenResponse(user: User): AuthTokenResponse {
        const payload: JwtPayload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }
}
