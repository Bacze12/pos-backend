import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Nombre actualizado de la categoría',
    example: 'Ropa',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descripción actualizada de la categoría',
    example: 'Ropa de moda',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Activa',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
