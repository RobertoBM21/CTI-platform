import {
    Body,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RegisterDto } from '../../application/dtos/register.dto';
import { AuthService } from '../../application/services/auth.service';
import { UserService } from '../../application/services/user.service';
import { User } from '../../domain';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_COOKIE = 'auth_token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}

    private setAuthCookie(res: Response, token: string): void {
        res.cookie(AUTH_COOKIE, token, {
            httpOnly: true,
            secure: this.configService.get('app.environment') === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE_MS,
            path: '/',
        });
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiOkResponse({ description: 'User registered' })
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already registered');
        const result = await this.authService.register(
            dto.email,
            dto.password,
            dto.name,
        );
        this.setAuthCookie(res, result.accessToken);
        return result;
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiOkResponse({ description: 'Returns user info; sets auth_token cookie' })
    login(
        @Req() req: Request & { user: User },
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = this.authService.buildTokenResponse(req.user);
        this.setAuthCookie(res, result.accessToken);
        return result;
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout — clears auth cookie' })
    @ApiOkResponse({ description: 'Cookie cleared' })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(AUTH_COOKIE, { path: '/' });
        return { ok: true };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiOkResponse({ description: 'Returns authenticated user info' })
    me(@Req() req: Request & { user: User }) {
        const { id, email, name } = req.user;
        return { id, email, name };
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
    @ApiOkResponse({ description: 'Redirects to Google OAuth2' })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    googleAuth() {}

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Google OAuth2 callback' })
    @ApiOkResponse({ description: 'Redirects to frontend with JWT token' })
    googleCallback(@Req() req: Request & { user: User }, @Res() res: Response) {
        const result = this.authService.buildTokenResponse(req.user);
        const frontendUrl = this.configService.get<string>(
            'app.corsOrigin',
            'http://localhost:3001',
        );
        res.redirect(
            `${frontendUrl}/api/auth/google/callback?token=${result.accessToken}`,
        );
    }
}
