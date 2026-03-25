import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  UseGuards,
  BadRequestException,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { EmbedService } from './embed.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { EmbedQueryDto } from './dto/embed-query.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

type AuthRequest = Request & {
  user?: {
    id: string;
    role?: UserRole | (string & {});
  };
};

@ApiTags('embed')
@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  // =========================================================================
  // ENDPOINTS PÚBLICOS (requieren API Key)
  // =========================================================================

  /**
   * Obtener testimonios publicados con API Key
   * Este es el endpoint que los clientes llaman desde sus sitios web
   */
  @Public()
  @Get('testimonials')
  @ApiOperation({
    summary: 'Obtener testimonios para embed (público con API Key)',
    description:
      'Endpoint público que devuelve testimonios publicados. Requiere API Key válida en el header X-API-Key. ' +
      'Si la API key está ligada a una categoría, siempre filtra por esa categoría y NO toma el parámetro ?category=. ' +
      'Solo las keys de alcance "all" (sin categoryId) pueden usar el parámetro ?category=<slug> o ver todas las categorías.',
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'API Key única del cliente',
    required: true,
    example: 'emb_1a2b3c4d5e6f7g8h9i0j',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description:
      'Slug de la categoría para filtrar. Solo aplica si la API key es de alcance "all".',
    example: 'producto',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de testimonios',
    example: 10,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Formato de respuesta: json o html',
    example: 'json',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonios obtenidos exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'API Key inválida o faltante',
  })
  async getTestimonials(
    @Headers('x-api-key') apiKey: string,
    @Query() query: EmbedQueryDto,
  ) {
    if (!apiKey) {
      throw new BadRequestException(
        'API Key es requerida en el header X-API-Key',
      );
    }

    const key = await this.embedService.validateApiKey(apiKey);
    if (!key) {
      throw new BadRequestException('API Key inválida o expirada');
    }

    // Opción A: si la key está ligada a categorías, forzamos ese filtro.
    // Si es "all" (sin categorías), se permite query.category opcional.
    const filters = {
      categoryIds:
        key.categories && key.categories.length > 0
          ? key.categories.map((c) => c.id)
          : undefined,
      categorySlug:
        key.categories && key.categories.length > 0
          ? undefined
          : query.category,
      limit: query.limit || 10,
    };

    return this.embedService.getPublicTestimonials(filters);
  }

  /**
   * Generar script JavaScript para embed
   * Los clientes incluyen este script en sus sitios web
   */
  @Public()
  @Get('script.js')
  @ApiOperation({
    summary: 'Obtener script JavaScript para embed',
    description:
      'Devuelve el código JavaScript que los clientes copian y pegan en sus sitios web. El script requiere llamar luego a TestimonialsWidget.load(apiKey, options).',
  })
  @ApiResponse({
    status: 200,
    description: 'Script generado exitosamente',
    content: {
      'application/javascript': {
        example: '(function() { /* código del widget */ })();',
      },
    },
  })
  getEmbedScript(@Res() res: Response) {
    const script = this.embedService.generateEmbedScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cachear 1 hora
    res.send(script);
  }

  // =========================================================================
  // ENDPOINTS DE ADMIN (requieren autenticación JWT + rol ADMIN)
  // =========================================================================

  /**
   * Crear una nueva API Key
   * Solo ADMIN puede crear API keys para clientes
   */
  @Post('api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva API Key (solo ADMIN)',
    description:
      'Genera una API Key única para que un cliente pueda integrar testimonios en su sitio web. ' +
      'Si envías categoryId, la key queda limitada a esa categoría y el endpoint público ignorará cualquier ?category=. ' +
      'Si categoryId se omite o es null, la key es de alcance "all" y puede ver todas las categorías (o filtrar por slug opcional).',
  })
  @ApiResponse({
    status: 201,
    description: 'API Key creada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de administrador',
  })
  async createApiKey(
    @Req() req: AuthRequest,
    @Body() dto: CreateApiKeyDto,
  ) {
    if (!req.user) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const apiKey = await this.embedService.createApiKey(dto, req.user.id);

    return {
      ...apiKey,
      message: `API Key creada exitosamente para "${dto.clientName}"`,
    };
  }

  /**
   * Listar todas las API Keys
   * Solo ADMIN puede ver todas las API keys
   */
  @Get('api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todas las API Keys (solo ADMIN)',
    description: 'Devuelve la lista de todas las API Keys creadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de API Keys obtenida exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de administrador',
  })
  async listApiKeys() {
    return await this.embedService.listApiKeys();
  }

  /**
   * Eliminar una API Key permanentemente
   * Solo ADMIN puede eliminar API keys
   */
  @Delete('api-keys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar una API Key (solo ADMIN)',
    description:
      'Elimina permanentemente una API Key. Los clientes con esta key ya no podrán acceder a los testimonios.',
  })
  @ApiResponse({
    status: 200,
    description: 'API Key eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'API Key no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de administrador',
  })
  async revokeApiKey(@Param('id') id: string) {
    return await this.embedService.revokeApiKey(id);
  }
}
