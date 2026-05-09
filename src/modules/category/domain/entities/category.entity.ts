import { BaseEntity } from '../../../../shared/domain/base-entity';

export class Category extends BaseEntity {
  private _name!: string;
  private _parentId?: string;

  private constructor() {
    super();
  }

  get name(): string {
    return this._name;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }
}
