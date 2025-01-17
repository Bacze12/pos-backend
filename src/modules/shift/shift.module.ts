import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shift, ShiftSchema } from './shift.schema';
import { ShiftsController } from './shift.controller';
import { ShiftService } from './shift.service';
import { UsersModule } from '../users/user.module';
import { Sale, SaleSchema } from '../sales/sales.schema';
import { User, UserSchema } from '../users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shift.name, schema: ShiftSchema },
      { name: User.name, schema: UserSchema },
      { name: Sale.name, schema: SaleSchema },
    ]),
    UsersModule,
  ],
  controllers: [ShiftsController],
  providers: [ShiftService],
  exports: [ShiftService, MongooseModule],
})
export class ShiftModule {}
