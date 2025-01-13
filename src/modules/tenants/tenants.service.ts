import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './tenants.schema';
import { FilterQuery, Model } from 'mongoose';
import { generateRandomPassword, hashPassword } from '../../middleware/crypto.middleware';
@Injectable()
export class TenantsService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<Tenant>) {}
  private readonly logger = new Logger(TenantsService.name);

  async findOne(criteria: FilterQuery<Tenant>): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con criterios:`, criteria);

    const tenant = await this.tenantModel.findOne(criteria).exec();
    if (!tenant) {
      this.logger.error('Tenant no encontrado con los criterios proporcionados');
      throw new NotFoundException('Tenant no encontrado');
    }

    return tenant;
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con email: ${email}`);
    return this.tenantModel.findOne({ email });
  }

  async findByBusinessNameAndEmail(businessName: string, email: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con businessName: ${businessName} y email: ${email}`);
    return this.tenantModel.findOne({ businessName, email });
  }

  async findByBusinessName(businessName: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant con businessName: ${businessName}`);
    return this.tenantModel.findOne({ businessName }).exec();
  }

  findAll() {
    throw new Error('Method not implemented.');
  }

  async create(tenantData: { businessName: string; email: string }) {
    const existingTenant = await this.tenantModel.findOne({
      businessName: tenantData.businessName,
      email: tenantData.email,
    });
    if (existingTenant) {
      throw new BadRequestException('El tenant ya existe');
    }

    const password = generateRandomPassword();
    const hashedPassword = hashPassword(password);

    const newTenant = new this.tenantModel({
      ...tenantData,
      password: hashedPassword,
    });

    const savedTenant = await newTenant.save();

    this.logger.log('Contraseña generada:', password);

    return {
      message: 'Tenant creado exitosamente',
      tenant: {
        businessName: savedTenant.businessName,
        email: savedTenant.email,
      },
      password, // Para desarrollo
    };
  }
}
