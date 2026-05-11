import { Category } from '../entities/category.entity';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository');
