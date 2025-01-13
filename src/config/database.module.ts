import { Module } from '@nestjs/common';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [DatabaseConfig],
  exports: [DatabaseConfig],
})
export class DatabaseModule {}
