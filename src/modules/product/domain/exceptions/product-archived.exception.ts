import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class ProductArchivedException extends DomainException {
  constructor() {
    super('Product is archived and cannot be modified');
  }
}
