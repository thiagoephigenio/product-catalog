import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { CategoryCreatedEvent } from '../events/category-created.event';

interface CreateCategoryProps {
  name: string;
  parentId?: string;
}

export class Category extends BaseEntity {
  private _name!: string;
  private _parentId?: string;

  private constructor() {
    super();
  }

  static create(props: CreateCategoryProps): Category {
    const category = new Category();
    category._id = uuidv4();
    category._name = props.name;
    category._parentId = props.parentId;
    category._createdAt = new Date();
    category._updatedAt = new Date();

    category.addDomainEvent(
      new CategoryCreatedEvent(category._id, category._name),
    );

    return category;
  }

  get name(): string {
    return this._name;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }
}
