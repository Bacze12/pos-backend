import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantSchema } from './tenants.schema';
import { TenantsRepository } from './repositories/tenants.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Tenant', schema: TenantSchema }])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository],
  exports: [TenantsService],
})
export class TenantsModule {}
