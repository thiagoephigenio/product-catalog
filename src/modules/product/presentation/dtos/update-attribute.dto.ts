import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttributeDto {
  @ApiProperty({ example: 'red' })
  @IsString()
  @IsNotEmpty()
  value!: string;
}
