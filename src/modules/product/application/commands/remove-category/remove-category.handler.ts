import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RemoveCategoryCommand } from './remove-category.command';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';
import { PRODUCT_EVENT_PUBLISHER } from '../../ports/product-event-publisher.interface';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

@CommandHandler(RemoveCategoryCommand)
export class RemoveCategoryHandler implements ICommandHandler<RemoveCategoryCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly eventPublisher: IProductEventPublisher,
    @InjectPinoLogger(RemoveCategoryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RemoveCategoryCommand): Promise<void> {
    const start = Date.now();
    const product = await this.productRepository.findById(command.productId);
    if (!product) throw new ProductNotFoundException(command.productId);

    product.removeCategory(command.categoryId);

    await this.productRepository.save(product);
    await this.eventPublisher.publish(product.pullDomainEvents());
    const logContext: Record<string, unknown> = {
      action: 'product.remove-category',
      productId: command.productId,
      categoryId: command.categoryId,
      correlationId: command.correlationId,
      durationMs: Date.now() - start,
    };
    this.logger.info(logContext, 'Category removed from product');
  }
}
