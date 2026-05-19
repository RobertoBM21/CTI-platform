import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../application/services/auth.service';
import { UserService } from '../../application/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: { cookies?: Record<string, string> } | null) =>
                    req?.cookies?.auth_token ?? null,
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('auth.jwtSecret'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userService.findById(payload.sub);
        if (!user) throw new UnauthorizedException('User not found');
        return user;
    }
}
