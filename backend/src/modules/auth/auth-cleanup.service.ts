import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Limpia usuarios con invitaciones expiradas (sin contraseña después de 72 horas)
   * Se ejecuta todos los días a las 3:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredInvitations() {
    this.logger.log(
      'Iniciando limpieza de invitaciones de editores expiradas...',
    );

    try {
      // Fecha límite: hace 72 horas (3 días)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - 72);

      // Buscar usuarios que:
      // 1. No tienen contraseña (passwordHash vacío o null)
      // 2. Tienen token de verificación de email expirado
      // 3. No están activos
      const expiredUsers = await this.userRepository.find({
        where: [
          {
            passwordHash: '',
            isActive: false,
            emailVerificationExpires: LessThan(new Date()),
          },
          {
            passwordHash: IsNull(),
            isActive: false,
            emailVerificationExpires: LessThan(new Date()),
          },
        ],
      });

      if (expiredUsers.length === 0) {
        this.logger.log(
          'No se encontraron invitaciones expiradas para limpiar',
        );
        return;
      }

      // Eliminar usuarios expirados (hard delete porque nunca completaron el registro)
      const userIds = expiredUsers.map((u) => u.id);
      await this.userRepository.delete(userIds);

      this.logger.log(
        `✅ Se eliminaron ${expiredUsers.length} invitaciones expiradas: ${expiredUsers.map((u) => u.email).join(', ')}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.stack ?? error.message : String(error);
      this.logger.error(
        '❌ Error al limpiar invitaciones expiradas:',
        errorMessage,
      );
    }
  }

  /**
   * Método manual para ejecutar la limpieza sin esperar al cron
   * Útil para testing o limpieza bajo demanda
   */
  async manualCleanup(): Promise<{ message: string; deletedCount: number }> {
    this.logger.log('Ejecutando limpieza manual de invitaciones expiradas...');

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 72);

    const expiredUsers = await this.userRepository.find({
      where: [
        {
          passwordHash: '',
          isActive: false,
          emailVerificationExpires: LessThan(new Date()),
        },
        {
          passwordHash: IsNull(),
          isActive: false,
          emailVerificationExpires: LessThan(new Date()),
        },
      ],
    });

    if (expiredUsers.length === 0) {
      return {
        message: 'No se encontraron invitaciones expiradas',
        deletedCount: 0,
      };
    }

    const userIds = expiredUsers.map((u) => u.id);
    await this.userRepository.delete(userIds);

    return {
      message: `Se eliminaron ${expiredUsers.length} invitaciones expiradas`,
      deletedCount: expiredUsers.length,
    };
  }
}
