import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RemoveAttributeCommand } from './remove-attribute.command';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';
import { PRODUCT_EVENT_PUBLISHER } from '../../ports/product-event-publisher.interface';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

@CommandHandler(RemoveAttributeCommand)
export class RemoveAttributeHandler implements ICommandHandler<RemoveAttributeCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly eventPublisher: IProductEventPublisher,
    @InjectPinoLogger(RemoveAttributeHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RemoveAttributeCommand): Promise<void> {
    const start = Date.now();
    const product = await this.productRepository.findById(command.productId);
    if (!product) throw new ProductNotFoundException(command.productId);

    product.removeAttribute(command.key);

    await this.productRepository.save(product);
    await this.eventPublisher.publish(product.pullDomainEvents());
    const logContext: Record<string, unknown> = {
      action: 'product.remove-attribute',
      productId: command.productId,
      correlationId: command.correlationId,
      durationMs: Date.now() - start,
    };
    this.logger.info(logContext, 'Product attribute removed');
  }
}
