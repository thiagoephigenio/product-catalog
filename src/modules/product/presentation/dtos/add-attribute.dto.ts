import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddAttributeDto {
  @ApiProperty({ example: 'color' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'blue' })
  @IsString()
  @IsNotEmpty()
  value!: string;
}
