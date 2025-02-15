import { MongooseModule } from '@nestjs/mongoose';

export const TestDatabaseConfig = MongooseModule.forRoot(
  process.env.MONGODB_URI?.replace('pos', 'pos_test') || 'mongodb://localhost:27017/pos_test',
);
