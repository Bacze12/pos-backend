import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({
    description: 'Hora de inicio del turno en formato ISO 8601',
    example: '2025-01-21T08:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Hora de finalización esperada del turno en formato ISO 8601',
    example: '2025-01-21T16:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Efectivo inicial del turno',
    example: 100.0,
  })
  @IsNumber()
  initialCash: number;
}

export class CloseShiftDto {
  @ApiProperty({
    description: 'Efectivo final al cerrar el turno',
    example: 120.0,
  })
  @IsNumber()
  @IsNotEmpty()
  finalCash: number;
}
