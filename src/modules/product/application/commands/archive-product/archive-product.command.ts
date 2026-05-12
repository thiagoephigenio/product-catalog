export class ArchiveProductCommand {
  constructor(
    public readonly productId: string,
    public readonly correlationId?: string,
  ) {}
}
