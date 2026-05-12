import { ProductDomainService } from './product-domain.service';
import { Product } from '../entities/product.entity';
import { ProductAttribute } from '../entities/product-attribute.vo';
import { ProductStatus } from '../enums/product-status.enum';
import { DuplicateProductNameException } from '../exceptions/duplicate-product-name.exception';
import { IProductRepository } from '../repositories/product.repository.interface';
import { MockedFunction } from 'vitest/dist/index.js';

const makeProduct = (id: string, name: string) =>
  Product.reconstitute({
    id,
    name,
    status: ProductStatus.DRAFT,
    attributes: [new ProductAttribute('key', 'value')],
    categoryIds: ['cat-id'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ProductDomainService', () => {
  let service: ProductDomainService;
  let mockRepo: {
    findByName: MockedFunction<IProductRepository['findByName']>;
  };

  beforeEach(() => {
    mockRepo = {
      findByName: vi.fn<IProductRepository['findByName']>(),
    };

    service = new ProductDomainService(
      mockRepo as unknown as IProductRepository,
    );
  });

  it('should not throw when no product with the same name exists', async () => {
    mockRepo.findByName.mockResolvedValue(null);
    const product = makeProduct('id-1', 'Smartphone');

    await expect(service.checkNameUniqueness(product)).resolves.toBeUndefined();
  });

  it('should not throw when the found product is the same product (update scenario)', async () => {
    const product = makeProduct('id-1', 'Smartphone');
    mockRepo.findByName.mockResolvedValue(product);

    await expect(service.checkNameUniqueness(product)).resolves.toBeUndefined();
  });

  it('should throw DuplicateProductNameException when another product has the same name', async () => {
    const existing = makeProduct('id-2', 'Smartphone');
    const product = makeProduct('id-1', 'Smartphone');
    mockRepo.findByName.mockResolvedValue(existing);

    await expect(service.checkNameUniqueness(product)).rejects.toThrow(
      DuplicateProductNameException,
    );
  });

  it('should search by the product name', async () => {
    mockRepo.findByName.mockResolvedValue(null);
    const product = makeProduct('id-1', 'Notebook');

    await service.checkNameUniqueness(product);

    expect(mockRepo.findByName).toHaveBeenCalledWith('Notebook');
  });
});
