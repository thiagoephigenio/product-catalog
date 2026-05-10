import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class ProductAlreadyActiveException extends DomainException {
  constructor() {
    super('Product is already active');
  }
}
