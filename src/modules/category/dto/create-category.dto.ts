import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Productos electrónicos',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Activa',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
