import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddAttributeCommand } from './add-attribute.command';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';
import { PRODUCT_EVENT_PUBLISHER } from '../../ports/product-event-publisher.interface';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

@CommandHandler(AddAttributeCommand)
export class AddAttributeHandler implements ICommandHandler<AddAttributeCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_EVENT_PUBLISHER)
    private readonly eventPublisher: IProductEventPublisher,
  ) {}

  async execute(command: AddAttributeCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) throw new ProductNotFoundException(command.productId);

    product.addAttribute(command.key, command.value);

    await this.productRepository.save(product);
    await this.eventPublisher.publish(product.pullDomainEvents());
  }
}
