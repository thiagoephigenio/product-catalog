import { CreateProductHandler } from './create-product.handler';
import { CreateProductCommand } from './create-product.command';
import { ProductCreatedEvent } from '../../../domain/events/product-created.event';
import { MockedFunction } from 'vitest/dist/index.js';
import { IProductRepository } from 'src/modules/product/domain/repositories/product.repository.interface';

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let mockRepo: {
    save: MockedFunction<IProductRepository['save']>;
  };
  let mockPublisher: { publish: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRepo = {
      save: vi.fn<IProductRepository['save']>().mockResolvedValue(undefined),
    };
    mockPublisher = { publish: vi.fn().mockResolvedValue(undefined) };
    handler = new CreateProductHandler(
      mockRepo as unknown as IProductRepository,
      mockPublisher,
    );
  });

  it('should return the created product id', async () => {
    const id = await handler.execute(new CreateProductCommand('Smartphone'));

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('should save the product to the repository', async () => {
    await handler.execute(new CreateProductCommand('Smartphone'));

    expect(mockRepo.save).toHaveBeenCalledOnce();
    const saved = mockRepo.save.mock.calls[0][0] as { name: string };
    expect(saved.name).toBe('Smartphone');
  });

  it('should save product with optional description', async () => {
    await handler.execute(
      new CreateProductCommand('Notebook', 'High-end laptop'),
    );

    const saved = mockRepo.save.mock.calls[0][0] as { description: string };
    expect(saved.description).toBe('High-end laptop');
  });

  it('should publish ProductCreatedEvent after saving', async () => {
    await handler.execute(new CreateProductCommand('Smartphone'));

    expect(mockPublisher.publish).toHaveBeenCalledOnce();
    const events = mockPublisher.publish.mock.calls[0][0] as unknown[];
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductCreatedEvent);
  });

  it('should publish events only after repository save succeeds', async () => {
    mockRepo.save.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new CreateProductCommand('Smartphone')),
    ).rejects.toThrow('DB error');

    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });
});
