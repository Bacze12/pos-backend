import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Precio del producto', example: 999.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: '63f1b23c9a7d2e1234abcd56',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Precio del producto', example: 999.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: '63f1b23c9a7d2e1234abcd56',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
