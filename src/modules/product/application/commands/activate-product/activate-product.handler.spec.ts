import { ActivateProductHandler } from './activate-product.handler';
import { ActivateProductCommand } from './activate-product.command';
import { Product } from '../../../domain/entities/product.entity';
import { ProductAttribute } from '../../../domain/entities/product-attribute.vo';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';
import { DuplicateProductNameException } from '../../../domain/exceptions/duplicate-product-name.exception';
import { ProductActivatedEvent } from '../../../domain/events/product-activated.event';
import { MockedFunction } from 'vitest/dist/index.js';
import { IProductRepository } from 'src/modules/product/domain/repositories/product.repository.interface';
import { ProductDomainService } from 'src/modules/product/domain/services/product-domain.service';
import { PinoLogger } from 'nestjs-pino';

const makeActivatableProduct = () =>
  Product.reconstitute({
    id: 'product-id',
    name: 'Smartphone',
    status: ProductStatus.DRAFT,
    attributes: [new ProductAttribute('color', 'black')],
    categoryIds: ['cat-id'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ActivateProductHandler', () => {
  let handler: ActivateProductHandler;
  let mockRepo: {
    save: MockedFunction<IProductRepository['save']>;
    findById: MockedFunction<IProductRepository['findById']>;
  };
  let mockPublisher: { publish: ReturnType<typeof vi.fn> };
  let mockDomainService: {
    checkNameUniqueness: MockedFunction<
      ProductDomainService['checkNameUniqueness']
    >;
  };

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn<IProductRepository['findById']>(),
      save: vi.fn<IProductRepository['save']>().mockResolvedValue(undefined),
    };
    mockPublisher = { publish: vi.fn().mockResolvedValue(undefined) };
    mockDomainService = {
      checkNameUniqueness: vi.fn().mockResolvedValue(undefined),
    };
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    } as unknown as PinoLogger;
    handler = new ActivateProductHandler(
      mockRepo as unknown as IProductRepository,
      mockPublisher,
      mockDomainService as unknown as ProductDomainService,
      mockLogger,
    );
  });

  it('should throw ProductNotFoundException when product does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new ActivateProductCommand('non-existent-id')),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('should call checkNameUniqueness before activating', async () => {
    mockRepo.findById.mockResolvedValue(makeActivatableProduct());

    await handler.execute(new ActivateProductCommand('product-id'));

    expect(mockDomainService.checkNameUniqueness).toHaveBeenCalledOnce();
  });

  it('should propagate DuplicateProductNameException from domain service', async () => {
    mockRepo.findById.mockResolvedValue(makeActivatableProduct());
    mockDomainService.checkNameUniqueness.mockRejectedValue(
      new DuplicateProductNameException('Smartphone'),
    );

    await expect(
      handler.execute(new ActivateProductCommand('product-id')),
    ).rejects.toThrow(DuplicateProductNameException);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should save the product after activation', async () => {
    mockRepo.findById.mockResolvedValue(makeActivatableProduct());

    await handler.execute(new ActivateProductCommand('product-id'));

    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('should publish ProductActivatedEvent after saving', async () => {
    mockRepo.findById.mockResolvedValue(makeActivatableProduct());

    await handler.execute(new ActivateProductCommand('product-id'));

    expect(mockPublisher.publish).toHaveBeenCalledOnce();
    const events = mockPublisher.publish.mock.calls[0][0] as unknown[];
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductActivatedEvent);
  });
});
