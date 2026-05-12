import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { randomUUID } from 'crypto';
import { CreateCategoryCommand } from '../../application/commands/create-category/create-category.command';
import { UpdateCategoryCommand } from '../../application/commands/update-category/update-category.command';
import { GetCategoryQuery } from '../../application/queries/get-category/get-category.query';
import { ListCategoriesQuery } from '../../application/queries/list-categories/list-categories.query';
import { Category } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CategoryResponseDto } from '../dtos/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiCreatedResponse({
    schema: { properties: { id: { type: 'string', format: 'uuid' } } },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({ description: 'Category name already exists' })
  @ApiNotFoundResponse({ description: 'Parent category not found' })
  async create(
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() dto: CreateCategoryDto,
  ): Promise<{ id: string }> {
    const cid = correlationId ?? randomUUID();
    const id = await this.commandBus.execute<CreateCategoryCommand, string>(
      new CreateCategoryCommand(dto.name, dto.parentId, cid),
    );
    return { id };
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.queryBus.execute<
      ListCategoriesQuery,
      Category[]
    >(new ListCategoriesQuery());
    return categories.map((c) => CategoryResponseDto.fromDomain(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.queryBus.execute<GetCategoryQuery, Category>(
      new GetCategoryQuery(id),
    );
    return CategoryResponseDto.fromDomain(category);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update a category' })
  @ApiNoContentResponse({ description: 'Updated successfully' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiConflictResponse({ description: 'Category name already exists' })
  @ApiUnprocessableEntityResponse({
    description: 'Cannot set category as its own parent',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async update(
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<void> {
    const cid = correlationId ?? randomUUID();
    await this.commandBus.execute(
      new UpdateCategoryCommand(id, dto.name, dto.parentId, cid),
    );
  }
}
