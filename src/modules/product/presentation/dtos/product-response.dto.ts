import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../domain/enums/product-status.enum';
import { Product } from '../../domain/entities/product.entity';

export class ProductAttributeDto {
  @ApiProperty({ example: 'color' })
  key!: string;

  @ApiProperty({ example: 'blue' })
  value!: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Smartphone XYZ' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, example: 'High-end smartphone' })
  description!: string | null;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.DRAFT })
  status!: ProductStatus;

  @ApiProperty({ type: [ProductAttributeDto] })
  attributes!: ProductAttributeDto[];

  @ApiProperty({
    type: [String],
    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
  })
  categoryIds!: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description ?? null;
    dto.status = product.status;
    dto.attributes = product.attributes.map((a) => ({
      key: a.key,
      value: a.value,
    }));
    dto.categoryIds = product.categoryIds;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    return dto;
  }
}
