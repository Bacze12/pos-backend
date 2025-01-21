import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './tenants.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tenants') // Agrupa los endpoints bajo el tag "tenants"
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}
  private readonly logger = new Logger(TenantsController.name);

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los tenants',
    description: 'Devuelve una lista de todos los tenants registrados.',
  })
  @ApiResponse({ status: 200, description: 'Lista de tenants recuperada exitosamente.' })
  async getTenants() {
    return this.tenantsService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo tenant',
    description: 'Crea un nuevo tenant con su nombre de negocio y correo electrónico.',
  })
  @ApiResponse({ status: 201, description: 'Tenant creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Faltan campos obligatorios o son incorrectos.',
  })
  async createTenant(
    @Body()
    tenantData: CreateTenantDto,
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
