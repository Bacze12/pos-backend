import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez', required: true })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    required: true,
  })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @IsEmail({}, { message: 'El correo electrónico debe ser un correo válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'password123', required: true })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  password: string;

  @ApiProperty({
    description: 'ID del tenant',
    example: '63f1b23c9a7d2e1234abcd56',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan', required: true })
  @IsString({ message: 'El nombre debe ser un texto' })
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez', required: true })
  @IsString({ message: 'El apellido debe ser un texto' })
  lastName: string;

  @ApiProperty({ description: 'Rol del usuario', example: 'admin', required: true })
  @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  @IsString({ message: 'El rol debe ser un texto' })
  role: string;
}
