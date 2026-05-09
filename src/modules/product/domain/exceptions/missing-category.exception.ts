import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class MissingCategoryException extends DomainException {
  constructor() {
    super('Product must have at least one category to be activated');
  }
}
