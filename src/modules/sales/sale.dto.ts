import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '63f1b23c9a7d2e1234abcd56',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto vendido',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 15.99,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Lista de productos vendidos',
    type: [SaleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({
    description: 'Total de la venta',
    example: 31.98,
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;
}

export class UpdateSaleDto {
  @ApiProperty({
    description: 'Lista actualizada de productos vendidos',
    type: [SaleItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items?: SaleItemDto[];

  @ApiProperty({
    description: 'Total actualizado de la venta',
    example: 31.98,
    required: false,
  })
  @IsNumber()
  total?: number;
}
