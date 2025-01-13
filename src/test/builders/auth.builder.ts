export class UserBuilder {
  private user: any = {
    name: 'Default Name',
    email: 'default@example.com',
    password: 'defaultPassword',
    role: 'USER',
    tenantId: 'defaultTenantId',
  };

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

  setRole(role: string): UserBuilder {
    this.user.role = role;
    return this;
  }

  setTenantId(tenantId: string): UserBuilder {
    this.user.tenantId = tenantId;
    return this;
  }

  build(): any {
    return { ...this.user };
  }
}
