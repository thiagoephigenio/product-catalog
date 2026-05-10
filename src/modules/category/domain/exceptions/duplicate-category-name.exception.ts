import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class DuplicateCategoryNameException extends DomainException {
  constructor(name: string) {
    super(`A category with name "${name}" already exists`);
  }
}
