import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nombre del negocio del tenant',
    example: 'Tech Corp',
    required: true,
  })
  @IsString({ message: 'El nombre del negocio debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  businessName: string;

  @ApiProperty({
    description: 'Correo electrónico del tenant',
    example: 'admin@techcorp.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;
}
