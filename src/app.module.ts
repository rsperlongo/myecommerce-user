import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MembersModule } from './modules/members/members.module';
import { InitialUsersMigration20260904191000 } from './infrastructure/persistence/typeorm/migrations/initial-users.migration';
import { UserProfilesMigration20260911120000 } from './infrastructure/persistence/typeorm/migrations/user-profiles.migration';
import { MembersMigration20260911130000 } from './infrastructure/persistence/typeorm/migrations/members.migration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST') || 'localhost',
        port: config.get<number>('POSTGRES_PORT') || 5432,
        username: config.get<string>('POSTGRES_USER') || 'postgres',
        password: config.get<string>('POSTGRES_PASSWORD') || 'postgres',
        database: config.get<string>('POSTGRES_DB') || 'mycommerce',
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [
          InitialUsersMigration20260904191000,
          UserProfilesMigration20260911120000,
          MembersMigration20260911130000,
        ],
      }),
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mycommerce',
    ),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args: unknown[]) => {
        const config = args[0] as ConfigService;
        return {
          config: {
            host: config.get<string>('REDIS_HOST') || 'localhost',
            port: config.get<number>('REDIS_PORT') || 6379,
          },
        };
      },
    }),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const rabbitmqUri =
            config.get<string>('RABBITMQ_URI') ||
            'amqp://guest:guest@localhost:5672';
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUri],
              queue: 'mycommerce_queue',
              queueOptions: { durable: true },
            },
          };
        },
      },
    ]),
    AuthModule,
    ProfileModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
