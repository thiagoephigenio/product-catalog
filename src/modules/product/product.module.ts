import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoryModule } from '../category/category.module';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { ProductTypeOrmRepository } from './infrastructure/persistence/repositories/product.typeorm-repository';
import { ProductDomainService } from './domain/services/product-domain.service';
import { PRODUCT_EVENT_PUBLISHER } from './application/ports/product-event-publisher.interface';
import { ProductEventPublisher } from './infrastructure/messaging/product-event.publisher';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { ActivateProductHandler } from './application/commands/activate-product/activate-product.handler';
import { ArchiveProductHandler } from './application/commands/archive-product/archive-product.handler';
import { UpdateProductHandler } from './application/commands/update-product/update-product.handler';
import { AddCategoryHandler } from './application/commands/add-category/add-category.handler';
import { RemoveCategoryHandler } from './application/commands/remove-category/remove-category.handler';
import { AddAttributeHandler } from './application/commands/add-attribute/add-attribute.handler';
import { UpdateAttributeHandler } from './application/commands/update-attribute/update-attribute.handler';
import { RemoveAttributeHandler } from './application/commands/remove-attribute/remove-attribute.handler';

const commandHandlers = [
  CreateProductHandler,
  ActivateProductHandler,
  ArchiveProductHandler,
  UpdateProductHandler,
  AddCategoryHandler,
  RemoveCategoryHandler,
  AddAttributeHandler,
  UpdateAttributeHandler,
  RemoveAttributeHandler,
];

@Module({
  imports: [CqrsModule, CategoryModule],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductTypeOrmRepository },
    { provide: PRODUCT_EVENT_PUBLISHER, useClass: ProductEventPublisher },
    ProductDomainService,
    ...commandHandlers,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
