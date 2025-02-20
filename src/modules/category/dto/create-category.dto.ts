import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

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
  description?: string;

  @ApiProperty({
    description: 'Activa',
    example: true,
  })
  isActive?: boolean;
}
