import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { ProductsModule } from './modules/products/products.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/user.module';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from './common/guard/roles.guard';
import { CategoriesModule } from './modules/category/category.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { SalesModule } from './modules/sales/sales.module';
import { SaleItemModule } from './modules/saleItem/saleItem.module';
import { ShiftModule } from './modules/shift/shift.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MemoryTrackingInterceptor } from './interceptor/memory-tracking.interceptor';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { InventoryModule } from './modules/inventory/inventory.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles globalmente
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        Logger.log('MONGO_URI from process.env:', process.env.MONGO_URI);
        return {
          uri: configService.get<string>('MONGO_URI'),
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    TenantsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    SupplierModule,
    ProductsModule,
    SalesModule,
    SaleItemModule,
    ShiftModule,
    InventoryModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [
    AppService,
    RolesGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: MemoryTrackingInterceptor,
    },
    MetricsService,
  ],
})
export class AppModule {}
