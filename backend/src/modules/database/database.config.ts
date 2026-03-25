import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  const host = configService.get<string>('DB_HOST');

  const isSupabase = host?.includes('supabase.co');

  return {
    type: 'postgres',
    host: host,
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],

    synchronize: true,
    logging: !isProduction,

    ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : false,

    uuidExtension: 'pgcrypto',

    autoLoadEntities: true,
    retryAttempts: 1,
    retryDelay: 1000,

    extra: {
      options: '-c search_path=public',
    },
  };
};
