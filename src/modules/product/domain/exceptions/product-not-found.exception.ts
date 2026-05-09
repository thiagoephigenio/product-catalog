import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class ProductNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Product not found: ${id}`);
  }
}
