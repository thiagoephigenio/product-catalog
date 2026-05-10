import { Module } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface';
import { CategoryTypeOrmRepository } from './infrastructure/persistence/repositories/category.typeorm-repository';

@Module({
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryTypeOrmRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoryModule {}
