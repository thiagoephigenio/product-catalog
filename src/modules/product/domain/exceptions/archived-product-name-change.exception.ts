import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class ArchivedProductNameChangeException extends DomainException {
  constructor() {
    super('Archived products cannot have their name changed');
  }
}
