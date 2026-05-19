import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { AuthModule } from './contexts/auth/infrastructure/auth.module';
import { CyberModule } from './contexts/cyber/infrastructure/cyber.module';
import { ReportingModule } from './contexts/reporting/infrastructure/reporting.module';
import { BundleIngestionService } from './contexts/shared/application/services/bundle-ingestion.service';
import { StixMapper } from './contexts/shared/application/services/stix-mapper.service';
import { IngestionController } from './contexts/shared/infrastructure/controllers/ingestion.controller';
import { SharedModule } from './contexts/shared/infrastructure/shared.module';
import { ThreatModule } from './contexts/threat/infrastructure/threat.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../.env',
            load: [appConfig, authConfig, databaseConfig],
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
        AuthModule,
        ThreatModule,
        CyberModule,
        ReportingModule,
    ],
    controllers: [IngestionController],
    providers: [StixMapper, BundleIngestionService],
})
export class AppModule {}
