import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class DuplicateAttributeKeyException extends DomainException {
  constructor(key: string) {
    super(`Attribute key "${key}" already exists on this product`);
  }
}
