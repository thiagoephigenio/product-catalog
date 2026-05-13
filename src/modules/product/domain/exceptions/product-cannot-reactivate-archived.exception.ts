import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class ProductCannotReactivateArchivedException extends DomainException {
  constructor() {
    super('Archived product cannot be reactivated');
  }
}
