// supplier.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Supplier } from './supplier.schema';
import { SupplierRepository } from './repositories/supplier.repository';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async findAll(tenantId: string): Promise<Supplier[]> {
    return this.supplierRepository.findAll(tenantId);
  }

  async findById(tenantId: string, supplierId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(tenantId, supplierId);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
    return supplier;
  }

  async create(tenantId: string, createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.supplierRepository.create(tenantId, createSupplierDto);
  }

  async update(
    tenantId: string,
    supplierId: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const updatedSupplier = await this.supplierRepository.update(
      tenantId,
      supplierId,
      updateSupplierDto,
    );
    if (!updatedSupplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
    return updatedSupplier;
  }

  async delete(tenantId: string, supplierId: string): Promise<void> {
    const deleted = await this.supplierRepository.delete(tenantId, supplierId);
    if (!deleted) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
  }
}
