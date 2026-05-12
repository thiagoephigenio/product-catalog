import { AddCategoryHandler } from './add-category.handler';
import { AddCategoryCommand } from './add-category.command';
import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';
import { CategoryNotFoundException } from '../../../../category/domain/exceptions/category-not-found.exception';
import { CategoryAddedEvent } from '../../../domain/events/category-added.event';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';
import type { ICategoryRepository } from '../../../../category/domain/repositories/category.repository.interface';
import { PinoLogger } from 'nestjs-pino';

const makeDraftProduct = () =>
  Product.reconstitute({
    id: 'product-id',
    name: 'Smartphone',
    status: ProductStatus.DRAFT,
    attributes: [],
    categoryIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('AddCategoryHandler', () => {
  let handler: AddCategoryHandler;
  let findProductById: ReturnType<typeof vi.fn>;
  let findCategoryById: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;
  let publish: ReturnType<typeof vi.fn>;
  let mockProductRepo: IProductRepository;
  let mockCategoryRepo: ICategoryRepository;
  let mockPublisher: IProductEventPublisher;

  beforeEach(() => {
    findProductById = vi.fn();
    findCategoryById = vi.fn();
    save = vi.fn().mockResolvedValue(undefined);
    publish = vi.fn().mockResolvedValue(undefined);

    mockProductRepo = {
      findById: findProductById,
      save: save,
      findByName: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    mockCategoryRepo = {
      findById: findCategoryById,
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    mockPublisher = {
      publish: publish,
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    } as unknown as PinoLogger;
    handler = new AddCategoryHandler(
      mockProductRepo,
      mockCategoryRepo,
      mockPublisher,
      mockLogger,
    );
  });

  it('should throw ProductNotFoundException when product does not exist', async () => {
    findProductById.mockResolvedValue(null);
    findCategoryById.mockResolvedValue({ id: 'cat-id' });

    await expect(
      handler.execute(new AddCategoryCommand('non-existent-id', 'cat-id')),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('should throw CategoryNotFoundException when category does not exist', async () => {
    findProductById.mockResolvedValue(makeDraftProduct());
    findCategoryById.mockResolvedValue(null);

    await expect(
      handler.execute(new AddCategoryCommand('product-id', 'non-existent-cat')),
    ).rejects.toThrow(CategoryNotFoundException);

    expect(save).not.toHaveBeenCalled();
  });

  it('should save the product after adding the category', async () => {
    findProductById.mockResolvedValue(makeDraftProduct());
    findCategoryById.mockResolvedValue({ id: 'cat-id' });

    await handler.execute(new AddCategoryCommand('product-id', 'cat-id'));

    expect(save).toHaveBeenCalledOnce();
  });

  it('should publish CategoryAddedEvent after saving', async () => {
    findProductById.mockResolvedValue(makeDraftProduct());
    findCategoryById.mockResolvedValue({ id: 'cat-id' });

    await handler.execute(new AddCategoryCommand('product-id', 'cat-id'));

    expect(publish).toHaveBeenCalledOnce();
    const [events] = publish.mock.calls[0] as [unknown[]];
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CategoryAddedEvent);
  });

  it('should resolve product and category lookups in parallel', async () => {
    findProductById.mockResolvedValue(makeDraftProduct());
    findCategoryById.mockResolvedValue({ id: 'cat-id' });

    await handler.execute(new AddCategoryCommand('product-id', 'cat-id'));

    expect(findProductById).toHaveBeenCalledWith('product-id');
    expect(findCategoryById).toHaveBeenCalledWith('cat-id');
  });
});
