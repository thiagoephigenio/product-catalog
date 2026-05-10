import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class ProductAlreadyArchivedException extends DomainException {
  constructor() {
    super('Product is already archived');
  }
}
