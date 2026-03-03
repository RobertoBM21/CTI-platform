import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { SharedModule } from './contexts/shared/infrastructure/shared.module';
import { ThreatModule } from './contexts/threat/infrastructure/threat.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [appConfig, databaseConfig],
        }),

        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>(
                    'database.uri',
                    'mongodb://localhost:27017/cti-platform',
                ),
            }),
        }),

        SharedModule,
        ThreatModule,
    ],
})
export class AppModule {}
