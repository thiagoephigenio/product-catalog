import { randomUUID } from 'crypto';
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductAttribute } from './product-attribute.vo';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductActivatedEvent } from '../events/product-activated.event';
import { ProductArchivedEvent } from '../events/product-archived.event';
import { CategoryAddedEvent } from '../events/category-added.event';
import { CategoryRemovedEvent } from '../events/category-removed.event';
import { AttributeAddedEvent } from '../events/attribute-added.event';
import { AttributeUpdatedEvent } from '../events/attribute-updated.event';
import { AttributeRemovedEvent } from '../events/attribute-removed.event';
import { MissingCategoryException } from '../exceptions/missing-category.exception';
import { MissingAttributeException } from '../exceptions/missing-attribute.exception';
import { ProductAlreadyActiveException } from '../exceptions/product-already-active.exception';
import { ProductAlreadyArchivedException } from '../exceptions/product-already-archived.exception';
import { ProductArchivedException } from '../exceptions/product-archived.exception';
import { DuplicateAttributeKeyException } from '../exceptions/duplicate-attribute-key.exception';
import { ArchivedProductNameChangeException } from '../exceptions/archived-product-name-change.exception';

interface CreateProductProps {
  name: string;
  description?: string;
}

interface ReconstituteProductProps {
  id: string;
  name: string;
  description?: string;
  status: ProductStatus;
  attributes: ProductAttribute[];
  categoryIds: string[];
  createdAt: Date;
  updatedAt: Date;
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
    product._id = randomUUID();
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

  static reconstitute(props: ReconstituteProductProps): Product {
    const product = new Product();
    product._id = props.id;
    product._name = props.name;
    product._description = props.description;
    product._status = props.status;
    product._attributes = props.attributes;
    product._categoryIds = props.categoryIds;
    product._createdAt = props.createdAt;
    product._updatedAt = props.updatedAt;
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

  addCategory(categoryId: string): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductArchivedException();
    }
    if (this._categoryIds.includes(categoryId)) {
      return;
    }

    this._categoryIds.push(categoryId);
    this._updatedAt = new Date();
    this.addDomainEvent(new CategoryAddedEvent(this._id, categoryId));
  }

  removeCategory(categoryId: string): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductArchivedException();
    }

    this._categoryIds = this._categoryIds.filter((id) => id !== categoryId);
    this._updatedAt = new Date();
    this.addDomainEvent(new CategoryRemovedEvent(this._id, categoryId));
  }

  addAttribute(key: string, value: string): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductArchivedException();
    }
    if (this._attributes.some((a) => a.key === key)) {
      throw new DuplicateAttributeKeyException(key);
    }

    this._attributes.push(new ProductAttribute(key, value));
    this._updatedAt = new Date();
    this.addDomainEvent(new AttributeAddedEvent(this._id, key, value));
  }

  updateAttribute(key: string, value: string): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductArchivedException();
    }

    this._attributes = this._attributes.map((a) =>
      a.key === key ? new ProductAttribute(key, value) : a,
    );
    this._updatedAt = new Date();
    this.addDomainEvent(new AttributeUpdatedEvent(this._id, key, value));
  }

  removeAttribute(key: string): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductArchivedException();
    }

    this._attributes = this._attributes.filter((a) => a.key !== key);
    this._updatedAt = new Date();
    this.addDomainEvent(new AttributeRemovedEvent(this._id, key));
  }

  updateName(name: string): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ArchivedProductNameChangeException();
    }
    this._name = name;
    this._updatedAt = new Date();
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
