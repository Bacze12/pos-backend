import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from '../tenants.schema';

@Injectable()
export class TenantsRepository {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<Tenant>) {}

  // **Método Unificado para Buscar Uno por Criterios**
  async findOne(criteria: any): Promise<Tenant | null> {
    return this.tenantModel.findOne(criteria).exec();
  }

  async findAll(tenantId: string): Promise<Tenant[]> {
    return this.tenantModel.find({ _id: tenantId }).exec();
  }

  async create(tenantData: any): Promise<Tenant> {
    const createdTenant = new this.tenantModel(tenantData);
    const savedTenant = await createdTenant.save();
    return savedTenant;
  }

  async findById(id: string) {
    return this.tenantModel.findById(id).exec();
  }

  async updatePassword(id: string, password: string) {
    return this.tenantModel.findOneAndUpdate({ _id: id }, { password }, { new: true }).exec();
  }

  async update(id: string, updateData: any) {
    return this.tenantModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).exec();
  }
}
