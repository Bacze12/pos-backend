import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser un correo válido' })
  email?: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'password123', required: false })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser un texto' })
  password?: string;
}
