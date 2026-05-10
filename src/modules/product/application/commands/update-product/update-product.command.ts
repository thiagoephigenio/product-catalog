export class UpdateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly description: string,
  ) {}
}
