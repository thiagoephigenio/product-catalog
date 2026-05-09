import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductAttribute } from './product-attribute.vo';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductActivatedEvent } from '../events/product-activated.event';
import { ProductArchivedEvent } from '../events/product-archived.event';
import { MissingCategoryException } from '../exceptions/missing-category.exception';
import { MissingAttributeException } from '../exceptions/missing-attribute.exception';
import { ProductAlreadyActiveException } from '../exceptions/product-already-active.exception';
import { ProductAlreadyArchivedException } from '../exceptions/product-already-archived.exception';

interface CreateProductProps {
  name: string;
  description?: string;
}

export class Product extends BaseEntity {
  private _name!: string;
  private _description?: string;
  private _status!: ProductStatus;
  private _attributes!: ProductAttribute[];
  private _categoryIds!: string[];

  private constructor() {
    super();
  }

  static create(props: CreateProductProps): Product {
    const product = new Product();
    product._id = uuidv4();
    product._name = props.name;
    product._description = props.description;
    product._status = ProductStatus.DRAFT;
    product._attributes = [];
    product._categoryIds = [];
    product._createdAt = new Date();
    product._updatedAt = new Date();

    product.addDomainEvent(new ProductCreatedEvent(product._id, product._name));

    return product;
  }

  activate(): void {
    if (this._status === ProductStatus.ACTIVE) {
      throw new ProductAlreadyActiveException();
    }
    if (this._categoryIds.length === 0) {
      throw new MissingCategoryException();
    }
    if (this._attributes.length === 0) {
      throw new MissingAttributeException();
    }

    this._status = ProductStatus.ACTIVE;
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductActivatedEvent(this._id));
  }

  archive(): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductAlreadyArchivedException();
    }

    this._status = ProductStatus.ARCHIVED;
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductArchivedEvent(this._id));
  }

  updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get attributes(): ProductAttribute[] {
    return [...this._attributes];
  }

  get categoryIds(): string[] {
    return [...this._categoryIds];
  }
}
