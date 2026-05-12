export class ActivateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly correlationId?: string,
  ) {}
}
