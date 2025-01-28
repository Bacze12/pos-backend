import { Controller, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateShiftDto, CloseShiftDto } from './shift.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';
import { UserEmail } from '../../common/decorator/user-email.decorator';

@ApiTags('shifts')
@ApiBearerAuth()
@Controller('shifts')
@UseGuards(AuthGuard('jwt'))
export class ShiftsController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo turno',
    description: 'Crea un turno para el tenant actual',
  })
  @ApiResponse({ status: 201, description: 'Turno creado con éxito.' })
  async createShift(
    @TenantId() tenantId: string,
    @UserEmail() email: string,
    @Body() shiftData: CreateShiftDto,
  ) {
    return this.shiftService.create(tenantId, email, shiftData);
  }

  @Put(':shiftId')
  @ApiOperation({
    summary: 'Actualizar turno',
    description: 'Actualiza un turno del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Turno actualizado con éxito.' })
  async updateShift(
    @TenantId() tenantId: string,
    @Param('shiftId') shiftId: string,
    @Body() updateData: any,
  ) {
    return this.shiftService.update(tenantId, shiftId, updateData);
  }

  @Delete(':shiftId')
  @ApiOperation({
    summary: 'Eliminar turno',
    description: 'Elimina un turno del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Turno eliminado con éxito.' })
  async deleteShift(@TenantId() tenantId: string, @Param('shiftId') shiftId: string) {
    return this.shiftService.delete(tenantId, shiftId);
  }

  @Patch(':shiftId/close')
  @ApiOperation({
    summary: 'Cerrar turno',
    description: 'Cierra un turno con el efectivo final',
  })
  @ApiResponse({ status: 200, description: 'Turno cerrado con éxito.' })
  async closeShift(
    @TenantId() tenantId: string,
    @UserEmail() email: string,
    @Param('shiftId') shiftId: string,
    @Body() closeData: CloseShiftDto,
  ) {
    return this.shiftService.closeShift(tenantId, email, shiftId, closeData.finalCash);
  }
}
