import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { ProductTypeOrmRepository } from './infrastructure/persistence/repositories/product.typeorm-repository';

@Module({
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeOrmRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
