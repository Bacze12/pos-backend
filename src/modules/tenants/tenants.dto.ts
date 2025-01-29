import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nombre del negocio del tenant',
    example: 'Tech Corp',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'Correo electrónico del tenant',
    example: 'admin@techcorp.com',
  })
  @IsEmail()
  email: string;
}

export class UpdateTenantPasswordDto {
  @ApiProperty({ description: 'Nueva contraseña', example: 'NuevaClaveSegura123!' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
