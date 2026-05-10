import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './create-category.command';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface';
import type { ICategoryEventPublisher } from '../../ports/category-event-publisher.interface';
import { CATEGORY_EVENT_PUBLISHER } from '../../ports/category-event-publisher.interface';
import { Category } from '../../../domain/entities/category.entity';
import { DuplicateCategoryNameException } from '../../../domain/exceptions/duplicate-category-name.exception';
import { CategoryNotFoundException } from '../../../domain/exceptions/category-not-found.exception';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<
  CreateCategoryCommand,
  string
> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(CATEGORY_EVENT_PUBLISHER)
    private readonly eventPublisher: ICategoryEventPublisher,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<string> {
    const existing = await this.categoryRepository.findByName(command.name);
    if (existing) throw new DuplicateCategoryNameException(command.name);

    if (command.parentId) {
      const parent = await this.categoryRepository.findById(command.parentId);
      if (!parent) throw new CategoryNotFoundException(command.parentId);
    }

    const category = Category.create({
      name: command.name,
      parentId: command.parentId,
    });
    await this.categoryRepository.save(category);
    await this.eventPublisher.publish(category.pullDomainEvents());
    return category.id;
  }
}
