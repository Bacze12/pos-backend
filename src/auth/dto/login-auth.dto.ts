import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nombre del negocio asociado al usuario',
    example: 'Tech Corp',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  businessName: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@techcorp.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
