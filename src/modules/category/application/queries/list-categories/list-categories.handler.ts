import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCategoriesQuery } from './list-categories.query';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<
  ListCategoriesQuery,
  Category[]
> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
