import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService, UserService } from '../application/services';
import { UserRepository } from '../domain';
import { AuthController } from './controllers/auth.controller';
import { GoogleAuthGuard, JwtAuthGuard, LocalAuthGuard } from './guards';
import { UserMongooseRepository } from './persistence/repositories/user.mongoose.repository';
import { UserDocument, UserSchema } from './persistence/schemas/user.schema';
import { GoogleStrategy, JwtStrategy, LocalStrategy } from './strategies';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService): JwtModuleOptions =>
                ({
                    secret: config.getOrThrow<string>('auth.jwtSecret'),
                    signOptions: {
                        expiresIn: config.get<string>(
                            'auth.jwtExpiresIn',
                            '7d',
                        ),
                    },
                }) as JwtModuleOptions,
        }),
        MongooseModule.forFeature([
            { name: UserDocument.name, schema: UserSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [
        UserMongooseRepository,
        {
            provide: UserRepository,
            useExisting: UserMongooseRepository,
        },
        UserService,
        AuthService,
        JwtStrategy,
        LocalStrategy,
        GoogleStrategy,
        JwtAuthGuard,
        LocalAuthGuard,
        GoogleAuthGuard,
    ],
    exports: [JwtAuthGuard, AuthService, UserService],
})
export class AuthModule {}
