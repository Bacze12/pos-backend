import { User } from '../../modules/users/users.schema';

export class UserBuilder {
  private user: Partial<User> = {};

  setName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  setEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  setPassword(password: string): UserBuilder {
    this.user.password = password;
    return this;
  }

  setTenantId(tenantId: string): UserBuilder {
    this.user.tenantId = tenantId;
    return this;
  }

  setRole(role: 'ADMIN' | 'CASHIER' | 'MANAGER'): UserBuilder {
    this.user.role = role;
    return this;
  }

  setIsActive(isActive: boolean): UserBuilder {
    this.user.isActive = isActive;
    return this;
  }

  build(): User {
    return this.user as User;
  }
}
