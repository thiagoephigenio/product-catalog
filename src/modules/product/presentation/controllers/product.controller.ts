import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { ActivateProductCommand } from '../../application/commands/activate-product/activate-product.command';
import { ArchiveProductCommand } from '../../application/commands/archive-product/archive-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product/update-product.command';
import { AddCategoryCommand } from '../../application/commands/add-category/add-category.command';
import { RemoveCategoryCommand } from '../../application/commands/remove-category/remove-category.command';
import { AddAttributeCommand } from '../../application/commands/add-attribute/add-attribute.command';
import { UpdateAttributeCommand } from '../../application/commands/update-attribute/update-attribute.command';
import { RemoveAttributeCommand } from '../../application/commands/remove-attribute/remove-attribute.command';
import { GetProductQuery } from '../../application/queries/get-product/get-product.query';
import { ListProductsQuery } from '../../application/queries/list-products/list-products.query';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { AddCategoryDto } from '../dtos/add-category.dto';
import { AddAttributeDto } from '../dtos/add-attribute.dto';
import { UpdateAttributeDto } from '../dtos/update-attribute.dto';
import { ProductResponseDto } from '../dtos/product-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({
    schema: { properties: { id: { type: 'string', format: 'uuid' } } },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async create(@Body() dto: CreateProductDto): Promise<{ id: string }> {
    const id = await this.commandBus.execute<CreateProductCommand, string>(
      new CreateProductCommand(dto.name, dto.description),
    );
    return { id };
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.queryBus.execute<ListProductsQuery, Product[]>(
      new ListProductsQuery(),
    );
    return products.map((p) => ProductResponseDto.fromDomain(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.queryBus.execute<GetProductQuery, Product>(
      new GetProductQuery(id),
    );
    return ProductResponseDto.fromDomain(product);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update product name and/or description' })
  @ApiNoContentResponse({ description: 'Updated successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnprocessableEntityResponse({
    description: 'Cannot update name of an archived product',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateProductCommand(id, dto?.name, dto.description),
    );
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activate a product' })
  @ApiNoContentResponse({ description: 'Product activated' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiConflictResponse({
    description: 'Another active product with the same name exists',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Missing category or attribute, or already active',
  })
  async activate(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new ActivateProductCommand(id));
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a product' })
  @ApiNoContentResponse({ description: 'Product archived' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnprocessableEntityResponse({ description: 'Product already archived' })
  async archive(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new ArchiveProductCommand(id));
  }

  @Post(':id/categories')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a category to a product' })
  @ApiNoContentResponse({ description: 'Category added' })
  @ApiNotFoundResponse({ description: 'Product or category not found' })
  @ApiUnprocessableEntityResponse({ description: 'Product is archived' })
  async addCategory(
    @Param('id') id: string,
    @Body() dto: AddCategoryDto,
  ): Promise<void> {
    await this.commandBus.execute(new AddCategoryCommand(id, dto.categoryId));
  }

  @Delete(':id/categories/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a category from a product' })
  @ApiNoContentResponse({ description: 'Category removed' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnprocessableEntityResponse({ description: 'Product is archived' })
  async removeCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveCategoryCommand(id, categoryId));
  }

  @Post(':id/attributes')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add an attribute to a product' })
  @ApiNoContentResponse({ description: 'Attribute added' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Duplicate attribute key or product is archived',
  })
  async addAttribute(
    @Param('id') id: string,
    @Body() dto: AddAttributeDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new AddAttributeCommand(id, dto.key, dto.value),
    );
  }

  @Put(':id/attributes/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update a product attribute' })
  @ApiNoContentResponse({ description: 'Attribute updated' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnprocessableEntityResponse({ description: 'Product is archived' })
  async updateAttribute(
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() dto: UpdateAttributeDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateAttributeCommand(id, key, dto.value),
    );
  }

  @Delete(':id/attributes/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a product attribute' })
  @ApiNoContentResponse({ description: 'Attribute removed' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnprocessableEntityResponse({ description: 'Product is archived' })
  async removeAttribute(
    @Param('id') id: string,
    @Param('key') key: string,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveAttributeCommand(id, key));
  }
}
