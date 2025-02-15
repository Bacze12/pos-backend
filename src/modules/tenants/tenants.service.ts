import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { Tenant } from './tenants.schema';
import { FilterQuery } from 'mongoose';
import { generateRandomPassword, hashPassword } from '../../middleware/crypto.middleware';
import { TenantsRepository } from './repositories/tenants.repository'; // Import TenantsRepository

@Injectable()
export class TenantsService {
  constructor(
    private tenantsRepository: TenantsRepository, // Inject TenantsRepository
    // @InjectModel(Tenant.name) private tenantModel: Model<Tenant> // Elimina la inyección de tenantModel
  ) {}
  private readonly logger = new Logger(TenantsService.name);

  async findOne(criteria: FilterQuery<Tenant>): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con criterios:`, criteria);

    const tenant = await this.tenantsRepository.findOne(criteria); // Usa tenantsRepository
    if (!tenant) {
      this.logger.error('Tenant no encontrado con los criterios proporcionados');
      throw new NotFoundException('Tenant no encontrado');
    }

    return tenant;
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con email: ${email}`);
    const criteria = { email }; // Define criterios para buscar por email
    return this.tenantsRepository.findOne(criteria); // Usa tenantsRepository.findOne con criterios
  }

  async findByBusinessNameAndEmail(businessName: string, email: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con businessName: ${businessName} y email: ${email}`);
    const criteria = { businessName, email }; // Define criterios para buscar por businessName y email
    return this.tenantsRepository.findOne(criteria); // Usa tenantsRepository.findOne con criterios
  }

  async findByBusinessName(businessName: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con businessName: ${businessName}`);
    const criteria = { businessName }; // Define criterios para buscar por businessName
    return this.tenantsRepository.findOne(criteria); // Usa tenantsRepository.findOne con criterios
  }

  // tenants.service.ts
  async findAll(tenantId: string): Promise<Tenant[]> {
    this.logger.log(`Buscando todos los tenants asociados al tenant padre: ${tenantId}`);
    // Busca todos los tenants donde parentTenant coincida con el tenantId proporcionado
    return this.tenantsRepository.findAll(tenantId); // Usa tenantsRepository
  }

  async create(tenantData: { businessName: string; email: string }) {
    const existingTenant = await this.tenantsRepository.findOne({
      // Usa tenantsRepository
      businessName: tenantData.businessName,
      email: tenantData.email,
    });
    if (existingTenant) {
      throw new ConflictException('El tenant ya existe');
    }

    const password = generateRandomPassword();
    const hashedPassword = hashPassword(password);

    const savedTenant = await this.tenantsRepository.create({
      ...tenantData,
      password: hashedPassword,
      isActive: true,
      activeSession: [],
      maxActiveSessions: 3,
    });

    // Asegurarse de que el ID esté disponible y convertido a string
    const tenantId = savedTenant._id.toString();

    return {
      message: 'Tenant creado exitosamente',
      tenant: {
        _id: tenantId,
        businessName: savedTenant.businessName,
        email: savedTenant.email,
      },
      password, // Para desarrollo
    };
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }
    return tenant;
  }

  async updatePassword(tenantId: string, newPassword: string) {
    this.logger.log(`Actualizando contraseña para el tenant con ID: ${tenantId}`);

    const tenant = await this.tenantsRepository.findById(tenantId); // Usa tenantsRepository
    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Hashear la nueva contraseña antes de guardarla
    tenant.password = hashPassword(newPassword);
    // await tenant.save(); // No es necesario guardar aquí, el repository updatePassword se encarga de guardar

    return this.tenantsRepository.updatePassword(tenantId, tenant.password); // Usa tenantsRepository.updatePassword y pasa la contraseña hasheada
  }

  async updateTenant(tenantId: string, updateData: Partial<Tenant>) {
    return this.tenantsRepository.update(tenantId, updateData); // Usa tenantsRepository
  }
}
