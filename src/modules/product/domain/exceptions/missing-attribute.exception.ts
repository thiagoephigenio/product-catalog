import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class MissingAttributeException extends DomainException {
  constructor() {
    super('Product must have at least one attribute to be activated');
  }
}
