import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../modules/tenants/tenants.service';
import { UsersService } from '../modules/users/users.service';
import { verifyPassword } from '../middleware/crypto.middleware';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async login(businessName: string, email: string, password: string) {
    // Paso 1: Buscar en la colección de tenants
    const tenant = await this.tenantsService.findByBusinessNameAndEmail(businessName, email);
    if (tenant) {
      // Validar si el tenant está activo
      if (!tenant.isActive) {
        throw new UnauthorizedException('El negocio está inactivo. Contacte al administrador.');
      }

      const isPasswordValid = verifyPassword(password, tenant.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Generar token para el tenant
      const payload = {
        tenantId: tenant._id, // Usar el _id como identificador único
        businessName: tenant.businessName,
        email: tenant.email,
        role: 'ADMIN', // Los tenants son administradores
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    // Paso 2: Buscar el tenant asociado al businessName
    const tenantFromBusiness = await this.tenantsService.findByBusinessName(businessName);
    if (!tenantFromBusiness) {
      throw new UnauthorizedException('El negocio no existe');
    }

    // Paso 3: Buscar el usuario asociado al tenantId
    const user = await this.usersService.findByEmailAndTenant(
      email,
      tenantFromBusiness._id.toString(),
    );
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Validar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('El usuario está inactivo. Contacte al administrador.');
    }

    // Paso 4: Verificar la contraseña del usuario
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token para el usuario
    const payload = {
      tenantId: user.tenantId,
      email: user.email,
      role: user.role, // El rol del usuario
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
