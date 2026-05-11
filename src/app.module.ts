import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { AuditModule } from './audit/audit.module';
import { ProductOrmEntity } from './modules/product/infrastructure/persistence/entities/product.orm-entity';
import { ProductAttributeOrmEntity } from './modules/product/infrastructure/persistence/entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from './modules/product/infrastructure/persistence/entities/product-category.orm-entity';
import { CategoryOrmEntity } from './modules/category/infrastructure/persistence/entities/category.orm-entity';
import { AuditLogOrmEntity } from './audit/persistence/entities/audit-log.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'catalog'),
        password: config.get<string>('DATABASE_PASSWORD', 'catalog'),
        database: config.get<string>('DATABASE_NAME', 'catalog'),
        synchronize:
          config.get<string>('DATABASE_SYNCHRONIZE', 'false') === 'true',
        logging: config.get<string>('NODE_ENV') === 'development',
        entities: [
          ProductOrmEntity,
          ProductAttributeOrmEntity,
          ProductCategoryOrmEntity,
          CategoryOrmEntity,
          AuditLogOrmEntity,
        ],
        migrations: ['dist/database/migrations/*.js'],
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),
    ProductModule,
    CategoryModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
