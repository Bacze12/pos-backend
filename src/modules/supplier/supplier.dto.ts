import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Proveedor ABC',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Información de contacto del proveedor',
    example: 'contacto@proveedorabc.com',
  })
  @IsString()
  @IsNotEmpty()
  contactInfo: string;
}

export class UpdateSupplierDto {
  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Proveedor XYZ',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Información de contacto del proveedor',
    example: 'contacto@proveedorxyz.com',
    required: false,
  })
  @IsString()
  contactInfo?: string;
}
