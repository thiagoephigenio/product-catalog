import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'Updated description' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
