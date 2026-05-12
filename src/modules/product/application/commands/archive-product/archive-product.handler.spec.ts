import { ArchiveProductHandler } from './archive-product.handler';
import { ArchiveProductCommand } from './archive-product.command';
import { Product } from '../../../domain/entities/product.entity';
import { ProductAttribute } from '../../../domain/entities/product-attribute.vo';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';
import { ProductAlreadyArchivedException } from '../../../domain/exceptions/product-already-archived.exception';
import { ProductArchivedEvent } from '../../../domain/events/product-archived.event';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import type { IProductEventPublisher } from '../../ports/product-event-publisher.interface';

const makeDraftProduct = () =>
  Product.reconstitute({
    id: 'product-id',
    name: 'Smartphone',
    status: ProductStatus.DRAFT,
    attributes: [new ProductAttribute('color', 'black')],
    categoryIds: ['cat-id'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makeArchivedProduct = () =>
  Product.reconstitute({
    id: 'product-id',
    name: 'Smartphone',
    status: ProductStatus.ARCHIVED,
    attributes: [],
    categoryIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ArchiveProductHandler', () => {
  let handler: ArchiveProductHandler;
  let findById: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;
  let publish: ReturnType<typeof vi.fn>;
  let mockRepo: IProductRepository;
  let mockPublisher: IProductEventPublisher;

  beforeEach(() => {
    findById = vi.fn();
    save = vi.fn().mockResolvedValue(undefined);
    publish = vi.fn().mockResolvedValue(undefined);

    mockRepo = {
      findById: findById,
      save: save,
      findByName: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    mockPublisher = {
      publish: publish,
    };

    handler = new ArchiveProductHandler(mockRepo, mockPublisher);
  });

  it('should throw ProductNotFoundException when product does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      handler.execute(new ArchiveProductCommand('non-existent-id')),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('should throw ProductAlreadyArchivedException when product is already archived', async () => {
    findById.mockResolvedValue(makeArchivedProduct());

    await expect(
      handler.execute(new ArchiveProductCommand('product-id')),
    ).rejects.toThrow(ProductAlreadyArchivedException);

    expect(save).not.toHaveBeenCalled();
  });

  it('should save the product after archiving', async () => {
    findById.mockResolvedValue(makeDraftProduct());

    await handler.execute(new ArchiveProductCommand('product-id'));

    expect(save).toHaveBeenCalledOnce();
  });

  it('should publish ProductArchivedEvent after saving', async () => {
    findById.mockResolvedValue(makeDraftProduct());

    await handler.execute(new ArchiveProductCommand('product-id'));

    expect(publish).toHaveBeenCalledOnce();
    const [events] = publish.mock.calls[0] as [unknown[]];
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductArchivedEvent);
  });

  it('should not publish events when repository save fails', async () => {
    findById.mockResolvedValue(makeDraftProduct());
    save.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new ArchiveProductCommand('product-id')),
    ).rejects.toThrow('DB error');

    expect(publish).not.toHaveBeenCalled();
  });
});
