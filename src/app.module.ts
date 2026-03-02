import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './contexts/shared/infrastructure/shared.module';
import { ThreatModule } from './contexts/threat/infrastructure/threat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/cti-platform',
        ),
      }),
    }),

    SharedModule,
    ThreatModule,
  ],
})
export class AppModule {}
