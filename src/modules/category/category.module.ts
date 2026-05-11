import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { AUDIT_QUEUE } from '../../audit/audit-event-payload.interface';
import { CategoryController } from './presentation/controllers/category.controller';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface';
import { CategoryTypeOrmRepository } from './infrastructure/persistence/repositories/category.typeorm-repository';
import { CATEGORY_EVENT_PUBLISHER } from './application/ports/category-event-publisher.interface';
import { CategoryEventPublisher } from './infrastructure/messaging/category-event.publisher';
import { CreateCategoryHandler } from './application/commands/create-category/create-category.handler';
import { UpdateCategoryHandler } from './application/commands/update-category/update-category.handler';
import { GetCategoryHandler } from './application/queries/get-category/get-category.handler';
import { ListCategoriesHandler } from './application/queries/list-categories/list-categories.handler';

const commandHandlers = [CreateCategoryHandler, UpdateCategoryHandler];
const queryHandlers = [GetCategoryHandler, ListCategoriesHandler];

@Module({
  imports: [CqrsModule, BullModule.registerQueue({ name: AUDIT_QUEUE })],
  controllers: [CategoryController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: CategoryTypeOrmRepository },
    { provide: CATEGORY_EVENT_PUBLISHER, useClass: CategoryEventPublisher },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoryModule {}
