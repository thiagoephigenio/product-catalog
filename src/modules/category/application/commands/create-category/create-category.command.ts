export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly parentId?: string,
    public readonly correlationId?: string,
  ) {}
}
