import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { CategoryCreatedEvent } from '../events/category-created.event';
import { CategoryUpdatedEvent } from '../events/category-updated.event';
import { SelfParentException } from '../exceptions/self-parent.exception';

interface CreateCategoryProps {
  name: string;
  parentId?: string;
}

interface UpdateCategoryProps {
  name: string;
  parentId?: string;
}

interface ReconstituteCategoryProps {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
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

  static reconstitute(props: ReconstituteCategoryProps): Category {
    const category = new Category();
    category._id = props.id;
    category._name = props.name;
    category._parentId = props.parentId;
    category._createdAt = props.createdAt;
    category._updatedAt = props.updatedAt;
    return category;
  }

  update(props: UpdateCategoryProps): void {
    if (props.parentId === this._id) {
      throw new SelfParentException();
    }

    this._name = props.name;
    this._parentId = props.parentId;
    this._updatedAt = new Date();

    this.addDomainEvent(new CategoryUpdatedEvent(this._id, this._name));
  }

  get name(): string {
    return this._name;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }
}
