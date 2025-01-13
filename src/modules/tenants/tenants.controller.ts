import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}
  private readonly logger = new Logger(TenantsController.name);

  @Get()
  async getTenants() {
    return this.tenantsService.findAll();
  }

  @Post()
  async createTenant(
    @Body()
    tenantData: {
      businessName: string;
      email: string;
    },
  ) {
    try {
      const newTenant = await this.tenantsService.create(tenantData);

      return {
        message: 'Tenant creado exitosamente',
        tenant: newTenant.tenant,
        password: newTenant.password, // Uniforme con el servicio
      };
    } catch (error) {
      this.logger.error('Error al crear tenant:', error.message);
      throw error; // Mantén el mensaje original del servicio
    }
  }
}
