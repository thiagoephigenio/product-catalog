import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { CategoryMapper } from '../../mappers/category.mapper';

@Injectable()
export class CategoryTypeOrmRepository implements ICategoryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<Category | null> {
    const orm = await this.dataSource
      .getRepository(CategoryOrmEntity)
      .findOne({ where: { id } });

    return orm ? CategoryMapper.toDomain(orm) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const orm = await this.dataSource
      .getRepository(CategoryOrmEntity)
      .findOne({ where: { name } });

    return orm ? CategoryMapper.toDomain(orm) : null;
  }

  async save(category: Category): Promise<void> {
    await this.dataSource
      .getRepository(CategoryOrmEntity)
      .save(CategoryMapper.toOrm(category));
  }

  async findAll(): Promise<Category[]> {
    const orms = await this.dataSource.getRepository(CategoryOrmEntity).find();
    return orms.map((orm) => CategoryMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(CategoryOrmEntity).delete(id);
  }
}
