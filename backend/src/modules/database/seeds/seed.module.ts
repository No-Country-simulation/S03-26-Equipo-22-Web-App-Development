import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../database.config';

import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Module({
  imports: [
    // 🔑 Carga variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔌 DB config (usa tu config existente)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // 📦 Repositorios necesarios
    TypeOrmModule.forFeature([User, Category]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class SeedModule {}
