export const AUDIT_QUEUE = 'product.events';

export interface AuditEventPayload {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  correlationId?: string;
}
