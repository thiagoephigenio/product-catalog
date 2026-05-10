import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface';
import type { Product } from '../entities/product.entity';
import { DuplicateProductNameException } from '../exceptions/duplicate-product-name.exception';

@Injectable()
export class ProductDomainService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async checkNameUniqueness(product: Product): Promise<void> {
    const existing = await this.productRepository.findByName(product.name);
    if (existing && existing.id !== product.id) {
      throw new DuplicateProductNameException(product.name);
    }
  }
}
