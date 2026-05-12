import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UpdateCategoryCommand } from './update-category.command';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface';
import type { ICategoryEventPublisher } from '../../ports/category-event-publisher.interface';
import { CATEGORY_EVENT_PUBLISHER } from '../../ports/category-event-publisher.interface';
import { CategoryNotFoundException } from '../../../domain/exceptions/category-not-found.exception';
import { DuplicateCategoryNameException } from '../../../domain/exceptions/duplicate-category-name.exception';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(CATEGORY_EVENT_PUBLISHER)
    private readonly eventPublisher: ICategoryEventPublisher,
    @InjectPinoLogger(UpdateCategoryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<void> {
    const start = Date.now();
    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) throw new CategoryNotFoundException(command.categoryId);

    const existing = await this.categoryRepository.findByName(command.name);
    if (existing && existing.id !== command.categoryId) {
      throw new DuplicateCategoryNameException(command.name);
    }

    if (command.parentId) {
      const parent = await this.categoryRepository.findById(command.parentId);
      if (!parent) throw new CategoryNotFoundException(command.parentId);
    }

    category.update({ name: command.name, parentId: command.parentId });

    await this.categoryRepository.save(category);
    await this.eventPublisher.publish(category.pullDomainEvents());
    const logContext: Record<string, unknown> = {
      action: 'category.update',
      categoryId: command.categoryId,
      correlationId: command.correlationId,
      durationMs: Date.now() - start,
    };
    this.logger.info(logContext, 'Category updated');
  }
}
