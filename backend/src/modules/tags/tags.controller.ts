import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Crear nuevo tag (solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Tag creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Tag ya existe' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async create(@Body() createTagDto: CreateTagDto) {
    return await this.tagsService.create(createTagDto);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({ summary: 'Listar TODOS los tags incluyendo inactivos (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista completa de tags obtenida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async findAllForAdmin() {
    return await this.tagsService.findAllForAdmin();
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({ summary: 'Listar todos los tags activos (público)' })
  @ApiResponse({ status: 200, description: 'Lista de tags obtenida' })
  async findAll() {
    return await this.tagsService.findAll();
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener tag por ID (público)' })
  @ApiResponse({ status: 200, description: 'Tag encontrado' })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.tagsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Actualizar tag (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Tag actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre de tag ya existe' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return await this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Eliminar tag (solo ADMIN)',
    description:
      'Si el tag está activo: lo desactiva (soft delete). ' +
      'Si el tag está inactivo: lo elimina permanentemente (hard delete).',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag desactivado o eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async remove(@Param('id') id: string) {
    return await this.tagsService.remove(id);
  }
}
