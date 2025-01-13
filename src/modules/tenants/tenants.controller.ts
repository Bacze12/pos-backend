import { Controller, Post, Body, Get } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

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
      console.error('Error al crear tenant:', error.message);
      throw error; // Mantén el mensaje original del servicio
    }
  }
}
