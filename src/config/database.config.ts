import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const DatabaseConfig = MongooseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('DATABASE_URL'),
    autoIndex: true, // Activa/desactiva índices automáticos (útil en desarrollo)
  }),
  inject: [ConfigService],
});
