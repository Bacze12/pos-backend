import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './tenants.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}
  private readonly logger = new Logger(TenantsController.name);

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los tenants',
    description: 'Devuelve una lista de todos los tenants registrados (requiere autenticación).',
  })
  @ApiResponse({ status: 200, description: 'Lista de tenants recuperada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getTenants(@TenantId() tenantId: string) {
    this.logger.log(`Consulta de todos los tenants solicitada por el tenant: ${tenantId}`);
    return this.tenantsService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo tenant',
    description: 'Crea un nuevo tenant padre con su nombre de negocio y correo electrónico.',
  })
  @ApiResponse({ status: 201, description: 'Tenant creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Faltan campos obligatorios o son incorrectos.',
  })
  async createTenant(@Body() tenantData: CreateTenantDto) {
    try {
      const newTenant = await this.tenantsService.create(tenantData);

      return {
        message: 'Tenant padre creado exitosamente',
        tenant: newTenant.tenant,
        password: newTenant.password,
      };
    } catch (error) {
      this.logger.error('Error al crear tenant:', error.message);
      throw error;
    }
  }
}
