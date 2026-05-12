import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UpdateProductCommand } from './update-product.command';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product.repository.interface';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @InjectPinoLogger(UpdateProductHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: UpdateProductCommand): Promise<void> {
    const start = Date.now();
    const product = await this.productRepository.findById(command.productId);
    if (!product) throw new ProductNotFoundException(command.productId);

    if (command.name !== undefined) {
      product.updateName(command.name);
    }
    if (command.description !== undefined) {
      product.updateDescription(command.description);
    }

    await this.productRepository.save(product);
    const logContext: Record<string, unknown> = {
      action: 'product.update',
      productId: command.productId,
      correlationId: command.correlationId,
      durationMs: Date.now() - start,
    };
    this.logger.info(logContext, 'Product updated');
  }
}
