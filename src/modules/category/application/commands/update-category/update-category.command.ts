export class UpdateCategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly name: string,
    public readonly parentId?: string,
    public readonly correlationId?: string,
  ) {}
}
