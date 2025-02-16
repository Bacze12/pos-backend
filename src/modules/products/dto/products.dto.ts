import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsMongoId } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Precio de compra', example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @ApiProperty({ description: 'Porcentaje de margen', example: 20 })
  @IsNumber()
  @IsNotEmpty()
  marginPercent: number;

  @ApiProperty({ description: 'Exento de IVA', example: false })
  @IsBoolean()
  @IsOptional()
  isIvaExempt?: boolean;

  @ApiProperty({ description: 'Tiene impuesto extra', example: false })
  @IsBoolean()
  @IsOptional()
  hasExtraTax?: boolean;

  @ApiProperty({ description: 'Tasa de impuesto extra', example: 15 })
  @IsNumber()
  @IsOptional()
  extraTaxRate?: number;

  @ApiProperty({ description: 'ID del proveedor', example: '63f1b23c9a7d2e1234abcd56' })
  @IsMongoId()
  @IsNotEmpty()
  supplier: string;

  @ApiProperty({ description: 'Cantidad en stock', example: 50 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'ID de la categoría', example: '63f1b23c9a7d2e1234abcd56' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;
}
