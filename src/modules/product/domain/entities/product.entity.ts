import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductAttribute } from './product-attribute.vo';
import { ProductCreatedEvent } from '../events/product-created.event';

interface CreateProductProps {
  name: string;
  description?: string;
}

export class Product extends BaseEntity {
  private _name!: string;
  private _description?: string;
  private _status!: ProductStatus;
  private _attributes!: ProductAttribute[];

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
    product._createdAt = new Date();
    product._updatedAt = new Date();

    product.addDomainEvent(new ProductCreatedEvent(product._id, product._name));

    return product;
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
}
