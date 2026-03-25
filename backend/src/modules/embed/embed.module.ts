import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmbedService } from './embed.service';
import { EmbedController } from './embed.controller';
import { EmbedApiKey } from './entities/embed-api-key.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { Category } from '../categories/entities/category.entity';

/**
 * Módulo de Embed
 *
 * Permite que clientes externos integren testimonios en sus sitios web
 * mediante API Keys y widgets JavaScript
 *
 * Funcionalidades:
 * - Generación de API Keys para clientes
 * - Endpoints públicos protegidos por API Key
 * - Generación de código JavaScript para embed
 * - Gestión de API Keys (crear, listar, revocar)
 */
@Module({
  imports: [
    // Registrar entidades de TypeORM que usa este módulo
    TypeOrmModule.forFeature([
      EmbedApiKey, // Entidad propia del módulo
      Testimonial, // Entidad de otro módulo (testimonials)
      Category, // Para validar categorías al crear API keys
    ]),

    // ConfigModule para acceder a variables de entorno
    ConfigModule,
  ],

  // Servicios que provee este módulo
  providers: [EmbedService],

  // Controladores (endpoints HTTP)
  controllers: [EmbedController],

  // Exportar servicio si otros módulos lo necesitan
  exports: [EmbedService],
})
export class EmbedModule {}
