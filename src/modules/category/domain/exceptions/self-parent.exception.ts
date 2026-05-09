import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class SelfParentException extends DomainException {
  constructor() {
    super('A category cannot be its own parent');
  }
}
