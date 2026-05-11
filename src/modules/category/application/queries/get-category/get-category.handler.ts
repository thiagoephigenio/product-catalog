import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoryQuery } from './get-category.query';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryNotFoundException } from '../../../domain/exceptions/category-not-found.exception';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<
  GetCategoryQuery,
  Category
> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoryQuery): Promise<Category> {
    const category = await this.categoryRepository.findById(query.categoryId);
    if (!category) throw new CategoryNotFoundException(query.categoryId);
    return category;
  }
}
