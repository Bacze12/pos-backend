import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
  Req,
  Patch,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateShiftDto, CloseShiftDto } from './shift.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('shifts') // Agrupa los endpoints bajo "shifts"
@ApiBearerAuth() // Indica que los endpoints requieren autenticación JWT
@Controller('shifts')
@UseGuards(AuthGuard('jwt'))
export class ShiftsController {
  constructor(private readonly shiftService: ShiftService) {}

  private getUserInfo(req): { tenantId: string; email: string } {
    const tenantId = req.user?.tenantId;
    const email = req.user?.email;
    if (!tenantId || !email) {
      throw new UnauthorizedException('Falta tenantId o email en el contexto del usuario');
    }
    return { tenantId, email };
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo turno',
    description: 'Crea un turno asociado al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Turno creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async createShift(@Req() req, @Body() shiftData: CreateShiftDto) {
    const { tenantId, email } = this.getUserInfo(req);
    return this.shiftService.create(tenantId, email, shiftData);
  }

  @Put(':tenantId/:shiftId')
  @ApiOperation({
    summary: 'Actualizar un turno',
    description: 'Actualiza los datos de un turno existente para el tenant especificado.',
  })
  @ApiResponse({ status: 200, description: 'Turno actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado.' })
  async updateShift(
    @Param('tenantId') tenantId: string,
    @Param('shiftId') shiftId: string,
    @Body() updateData: any,
  ) {
    return this.shiftService.update(tenantId, shiftId, updateData);
  }

  @Delete(':tenantId/:shiftId')
  @ApiOperation({
    summary: 'Eliminar un turno',
    description: 'Elimina un turno asociado al tenant especificado.',
  })
  @ApiResponse({ status: 200, description: 'Turno eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado.' })
  async deleteShift(@Param('tenantId') tenantId: string, @Param('shiftId') shiftId: string) {
    return this.shiftService.delete(tenantId, shiftId);
  }

  @Patch(':shiftId/close')
  @ApiOperation({
    summary: 'Cerrar un turno',
    description: 'Cierra un turno especificando el efectivo final.',
  })
  @ApiResponse({ status: 200, description: 'Turno cerrado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado.' })
  async closeShift(
    @Req() req,
    @Param('shiftId') shiftId: string,
    @Body() closeData: CloseShiftDto,
  ) {
    const { tenantId, email } = this.getUserInfo(req);
    return this.shiftService.closeShift(tenantId, email, shiftId, closeData.finalCash);
  }
}
