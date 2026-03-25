import {
  Controller,
  Post,
  Param,
  Body,
  Patch,
  UseGuards,
  Req,
  Get,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CompleteInvitationDto } from './dto/complete-invitation.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ModerateTestimonialDto } from './dto/moderate.dto';
import { Request } from 'express';
import { UserRole } from '../users/entities/user.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

type AuthRequest = Request & {
  user?: {
    id: string;
    role?: UserRole | (string & {});
  };
};

@ApiTags('testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  // ---------------------------------------------------------------------------
  // INVITACIONES
  // ---------------------------------------------------------------------------

  @Post('invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear invitación para un invitado',
    description:
      'Crea un token único y envía un email con un enlace para completar el testimonio.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitación creada correctamente.',
  })
  createInvitation(@Req() req: AuthRequest, @Body() dto: CreateInvitationDto) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.createInvitation(req.user.id, dto);
  }

  // ---------------------------------------------------------------------------
  @Public()
  @Post('invitations/:token/complete')
  @ApiOperation({
    summary: 'Completar invitación con testimonio + imagen',
    description:
      'Permite subir texto + imagen que será guardada en Cloudinary.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'token', description: 'Token único de invitación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        authorName: { type: 'string' },
        authorRole: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del testimonio',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Testimonio creado como borrador.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
  @ApiResponse({
    status: 404,
    description: 'Invitación no encontrada o ya usada.',
  })
  @UseInterceptors(FileInterceptor('image'))
  async completeInvitationWithImage(
    @Param('token') token: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CompleteInvitationDto,
  ) {
    return this.testimonialsService.completeByToken(token, dto, image);
  }

  // ---------------------------------------------------------------------------
  // UPDATE TESTIMONIAL
  // ---------------------------------------------------------------------------

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un testimonio',
    description:
      'Solo el creador puede editar un testimonio en DRAFT o REJECTED.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Testimonio actualizado.' })
  update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateTestimonialDto,
  ) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.update(id, req.user.id, dto);
  }

  // ---------------------------------------------------------------------------
  // SUBMIT FOR REVIEW
  // ---------------------------------------------------------------------------

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar un testimonio para revisión',
  })
  @ApiParam({ name: 'id' })
  submitForReview(@Param('id') id: string, @Req() req: AuthRequest) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.submitForReview(id, req.user.id);
  }

  // ---------------------------------------------------------------------------
  // MODERACIÓN
  // ---------------------------------------------------------------------------

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aprobar o rechazar un testimonio',
  })
  @ApiParam({ name: 'id' })
  moderate(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: ModerateTestimonialDto,
  ) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.moderate(id, req.user.id, dto);
  }

  // ---------------------------------------------------------------------------
  // PUBLICAR / DESPUBLICAR
  // ---------------------------------------------------------------------------

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar un testimonio aprobado' })
  @ApiParam({ name: 'id' })
  publish(@Param('id') id: string, @Req() req: AuthRequest) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.publish(id, req.user.id);
  }

  // ---------------------------------------------------------------------------

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Despublicar un testimonio' })
  @ApiParam({ name: 'id' })
  unpublish(@Param('id') id: string, @Req() req: AuthRequest) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.unpublish(id, req.user.id);
  }

  // ---------------------------------------------------------------------------
  // ELIMINAR TESTIMONIO
  // ---------------------------------------------------------------------------

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un testimonio (solo admin)' })
  @ApiParam({ name: 'id' })
  delete(@Param('id') id: string, @Req() req: AuthRequest) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.delete(id);
  }

  // ---------------------------------------------------------------------------
  // ENDPOINT PÚBLICO: Obtener testimonios publicados
  // ---------------------------------------------------------------------------

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Listar testimonios públicos',
    description: 'Devuelve solo los testimonios con estado PUBLISHED.',
  })
  @ApiResponse({ status: 200 })
  getPublicTestimonials() {
    return this.testimonialsService.getPublicTestimonials();
  }
  // ---------------------------------------------------------------------------
  // EDITOR: Obtener todos los testimonios del editor
  // ---------------------------------------------------------------------------
  @Get('editor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar testimonios del editor autenticado',
  })
  getAllForEditor(@Req() req: AuthRequest) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.getAllForEditor(req.user.id);
  }
  @Get('editor/count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({ summary: 'Cantidad total de testimonios del editor' })
  async countEditorTestimonials(
    @Req() req: Request & { user: { id: string } },
  ) {
    return {
      total: await this.testimonialsService.countForEditor(req.user.id),
    };
  }
  // ---------------------------------------------------------------------------
  // EDITOR: Obtener un testimonio por ID del editor
  // ---------------------------------------------------------------------------
  @Get('editor/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un testimonio del editor por ID',
  })
  @ApiParam({ name: 'id' })
  getOneForEditor(@Param('id') id: string, @Req() req: AuthRequest) {
    if (!req.user) throw new Error('Usuario no autenticado');
    return this.testimonialsService.getOneForEditor(id, req.user.id);
  }
  // ---------------------------------------------------------------------------
  // ADMIN: Obtener todos los testimonios del sistema
  // ---------------------------------------------------------------------------
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos los testimonios (solo admin)',
    description:
      'Permite al administrador ver todos los testimonios sin restricciones.',
  })
  @ApiResponse({ status: 200, description: 'Listado completo de testimonios.' })
  getAllForAdmin() {
    return this.testimonialsService.getAllForAdmin();
  }
}
