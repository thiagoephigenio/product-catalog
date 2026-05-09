import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class DuplicateProductNameException extends DomainException {
  constructor(name: string) {
    super(`A product with name "${name}" already exists`);
  }
}
