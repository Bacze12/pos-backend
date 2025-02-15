import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTenantPasswordDto {
  @ApiProperty({ description: 'Nueva contraseña', example: 'NuevaClaveSegura123!' })
  @IsString({ message: 'La nueva contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  newPassword: string;
}
