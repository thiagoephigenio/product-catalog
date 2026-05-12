import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AddCategoryCommand } from './add-category.command';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';
import { PRODUCT_EVENT_PUBLISHER } from '../../ports/product-event-publisher.interface';
import type { ICategoryRepository } from '../../../../category/domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../../category/domain/repositories/category.repository.interface';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';
import { CategoryNotFoundException } from '../../../../category/domain/exceptions/category-not-found.exception';

@CommandHandler(AddCategoryCommand)
export class AddCategoryHandler implements ICommandHandler<AddCategoryCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly eventPublisher: IProductEventPublisher,
    @InjectPinoLogger(AddCategoryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: AddCategoryCommand): Promise<void> {
    const start = Date.now();
    const [product, category] = await Promise.all([
      this.productRepository.findById(command.productId),
      this.categoryRepository.findById(command.categoryId),
    ]);

    if (!product) throw new ProductNotFoundException(command.productId);
    if (!category) throw new CategoryNotFoundException(command.categoryId);

    product.addCategory(command.categoryId);

    await this.productRepository.save(product);
    await this.eventPublisher.publish(product.pullDomainEvents());
    const logContext: Record<string, unknown> = {
      action: 'product.add-category',
      productId: command.productId,
      categoryId: command.categoryId,
      correlationId: command.correlationId,
      durationMs: Date.now() - start,
    };
    this.logger.info(logContext, 'Category added to product');
  }
}
