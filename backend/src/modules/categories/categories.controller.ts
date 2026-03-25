import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Crear nueva categoría (solo ADMIN)',
    description:
      'Permite a los administradores crear nuevas categorías para clasificar testimonios.',
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    schema: {
      example: {
        id: 'uuid-categoria',
        name: 'Producto',
        description: 'Testimonios relacionados con productos o servicios',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Requiere rol de ADMIN',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una categoría con ese nombre',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // 50 requests per minute
  @ApiOperation({
    summary: 'Obtener todas las categorías (público)',
    description:
      'Devuelve la lista completa de categorías disponibles, ordenadas alfabéticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Cliente',
          description: 'Testimonios de clientes satisfechos',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
        {
          id: 'uuid-2',
          name: 'Evento',
          description: 'Testimonios sobre eventos organizados',
          createdAt: '2025-01-15T10:35:00.000Z',
          updatedAt: '2025-01-15T10:35:00.000Z',
        },
      ],
    },
  })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // 50 requests per minute
  @ApiOperation({
    summary: 'Obtener una categoría por ID (público)',
    description: 'Devuelve los detalles de una categoría específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 'uuid-categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría obtenida exitosamente',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Producto',
        description: 'Testimonios relacionados con productos o servicios',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Actualizar una categoría (solo ADMIN)',
    description:
      'Permite a los administradores actualizar el nombre, descripción o estado de una categoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría a actualizar',
    example: 'uuid-categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Producto Actualizado',
        description: 'Descripción actualizada',
        isActive: true,
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T12:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Requiere rol de ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una categoría con ese nombre',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Eliminar categoría (solo ADMIN)',
    description:
      'Si la categoría está activa: la desactiva (soft delete). ' +
      'Si la categoría está inactiva: la elimina permanentemente (hard delete).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría a eliminar',
    example: 'uuid-categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría desactivada o eliminada exitosamente',
    schema: {
      example: {
        message: 'Categoría "Producto" desactivada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Requiere rol de ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async remove(@Param('id') id: string) {
    return await this.categoriesService.remove(id);
  }
}
