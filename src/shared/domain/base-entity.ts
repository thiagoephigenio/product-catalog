import { DomainEvent } from './domain-event';

export abstract class BaseEntity {
  private _domainEvents: DomainEvent[] = [];

  protected _id!: string;
  protected _createdAt!: Date;
  protected _updatedAt!: Date;

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
