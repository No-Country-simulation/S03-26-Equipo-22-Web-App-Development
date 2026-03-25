import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/entities/user.entity';
import 'dotenv/config';

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  console.log(process.env.DATABASE_PASSWORD);
  const usersService = app.get(UsersService);

  const email = process.env.ADMIN_EMAIL || 'admin@test.com';
  const password = process.env.ADMIN_PASSWORD || 'Password123!';

  const existing = await usersService.findByEmail(email);

  if (existing) {
    console.log('⚠️ El admin ya existe');
    await app.close();
    return;
  }

  await usersService.create({
    email,
    password,
    fullName: 'Admin Principal',
    role: UserRole.ADMIN,
  });

  console.log('✅ Admin creado correctamente');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
