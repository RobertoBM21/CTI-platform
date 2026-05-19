import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>('auth.googleClientId'),
            clientSecret: configService.getOrThrow<string>(
                'auth.googleClientSecret',
            ),
            callbackURL: configService.getOrThrow<string>(
                'auth.googleCallbackUrl',
            ),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ) {
        return this.authService.findOrCreateGoogleUser({
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails ?? [],
        });
    }
}
