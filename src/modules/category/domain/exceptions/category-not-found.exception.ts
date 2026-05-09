import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class CategoryNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Category not found: ${id}`);
  }
}
