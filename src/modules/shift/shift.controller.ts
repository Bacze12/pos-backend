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

@Controller('shifts')
@UseGuards(AuthGuard('jwt'))
export class ShiftsController {
  constructor(private readonly shiftService: ShiftService) {}

  private getUserInfo(req): { tenantId: string; email: string } {
    const tenantId = req.user?.tenantId;
    const email = req.user?.email;
    if (!tenantId || !email) {
      throw new UnauthorizedException('Falta tenantId o userId en el contexto del usuario');
    }
    return { tenantId, email };
  }

  // @Get('')
  // async getShifts(@Req() req) {
  //   const { tenantId, userId } = this.getUserInfo(req);
  //   return this.shiftService.findAll(tenantId, userId);
  // }

  @Post()
  async createShift(@Req() req, @Body() shiftData: any) {
    const { tenantId, email } = this.getUserInfo(req);
    return this.shiftService.create(tenantId, email, shiftData);
  }

  @Put(':tenantId/:shiftId')
  async updateShift(
    @Param('tenantId') tenantId: string,
    @Param('shiftId') shiftId: string,
    @Body() updateData: any,
  ) {
    return this.shiftService.update(tenantId, shiftId, updateData);
  }

  @Delete(':tenantId/:shiftId')
  async deleteShift(@Param('tenantId') tenantId: string, @Param('shiftId') shiftId: string) {
    return this.shiftService.delete(tenantId, shiftId);
  }

  @Patch(':shiftId/close')
  async closeShift(@Req() req, @Param('shiftId') shiftId: string, @Body() closeData: any) {
    const { tenantId, email } = this.getUserInfo(req);
    return this.shiftService.closeShift(tenantId, email, shiftId, closeData.finalCash);
  }
}
