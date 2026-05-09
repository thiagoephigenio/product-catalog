import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductAttribute } from './product-attribute.vo';

export class Product extends BaseEntity {
  private _name!: string;
  private _description?: string;
  private _status!: ProductStatus;
  private _attributes!: ProductAttribute[];

  private constructor() {
    super();
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
