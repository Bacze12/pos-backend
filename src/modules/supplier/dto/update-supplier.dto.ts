import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateSupplierDto {
  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Distribuidora XYZ',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Correo electrónico del proveedor',
    example: 'contacto@distribuidoraxyz.com',
    required: false,
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Teléfono del proveedor',
    example: '+34 612345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Dirección del proveedor',
    example: 'Calle Principal 123, Ciudad',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Estado del proveedor',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'IDs de los productos asociados',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  products?: Types.ObjectId[];
}
