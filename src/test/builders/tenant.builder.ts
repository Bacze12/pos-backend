import { Tenant } from '../../modules/tenants/tenants.schema';

export class TenantBuilder {
  private tenant: Partial<Tenant> = {};

  setBusinessName(businessName: string): TenantBuilder {
    this.tenant.businessName = businessName;
    return this;
  }

  setEmail(email: string): TenantBuilder {
    this.tenant.email = email;
    return this;
  }

  setPassword(password: string): TenantBuilder {
    this.tenant.password = password;
    return this;
  }

  build(): Tenant {
    if (
      !this.tenant.businessName ||
      !this.tenant.email ||
      !this.tenant.password
    ) {
      throw new Error('Faltan propiedades obligatorias en el tenant.');
    }
    return this.tenant as Tenant;
  }
}
