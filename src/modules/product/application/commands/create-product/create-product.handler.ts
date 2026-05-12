import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateProductCommand } from './create-product.command';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';
import { PRODUCT_EVENT_PUBLISHER } from '../../ports/product-event-publisher.interface';
import { Product } from '../../../domain/entities/product.entity';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<
  CreateProductCommand,
  string
> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly eventPublisher: IProductEventPublisher,
    @InjectPinoLogger(CreateProductHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const start = Date.now();
    const product = Product.create({
      name: command.name,
      description: command.description,
    });
    await this.productRepository.save(product);
    await this.eventPublisher.publish(product.pullDomainEvents());
    const logContext: Record<string, unknown> = {
      action: 'product.create',
      productId: product.id,
      correlationId: command.correlationId,
      durationMs: Date.now() - start,
    };
    this.logger.info(logContext, 'Product created');
    return product.id;
  }
}
