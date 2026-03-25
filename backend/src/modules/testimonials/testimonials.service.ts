import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialStatus } from './entities/testimonial.entity';
import { MediaType } from './entities/testimonial.entity';
import { TestimonialInvitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CompleteInvitationDto } from './dto/complete-invitation.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ModerateTestimonialDto } from './dto/moderate.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { MediaService } from '../media/media.service';
import { EditorTestimonialDto } from './dto/editor-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialRepo: Repository<Testimonial>,

    @InjectRepository(TestimonialInvitation)
    private invitationRepo: Repository<TestimonialInvitation>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    private readonly emailService: EmailService,
    private readonly mediaService: MediaService,
  ) {}

  // -------------------------------------------------------
  // INVITATION
  // -------------------------------------------------------

  async createInvitation(editorId: string, dto: CreateInvitationDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 1. Generar el token
    const token = crypto.randomUUID();

    // 2. Guardar la invitación (asignando ids directos)
    const invitation = this.invitationRepo.create({
      token,
      invitedEmail: dto.invitedEmail,
      editorId: editorId,
      categoryId: dto.categoryId,
    } as DeepPartial<TestimonialInvitation>);

    await this.invitationRepo.save(invitation);

    // 3. Preparar datos para el email
    const fullName = category.name; // O el nombre del usuario que invita
    const testimonialNombre = category.name;

    // 4. Enviar el email usando tu emailService
    await this.emailService.sendTestimonialInvitationEmail(
      dto.invitedEmail,
      token,
      fullName,
      testimonialNombre,
    );

    return {
      message: 'Invitation created and email sent',
      invitationId: invitation.id,
    };
  }

  // -------------------------------------------------------
  // COMPLETE INVITATION
  // -------------------------------------------------------

  async completeByToken(
    token: string,
    dto: CompleteInvitationDto,
    file?: Express.Multer.File, // imagen opcional
  ) {
    const invitation = await this.invitationRepo.findOne({ where: { token } });
    if (!invitation || invitation.used)
      throw new NotFoundException('Invitación inválida o ya utilizada');

    invitation.used = true;
    invitation.usedAt = new Date();
    await this.invitationRepo.save(invitation);

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    let videoProvider: 'youtube' | 'vimeo' | 'direct' | null = null;
    let mediaType = MediaType.TEXT;

    // =============================
    // Imagen → Cloudinary
    // =============================
    if (file) {
      const uploaded = await this.mediaService.uploadImage(file, {
        folder: 'testimonials',
      });
      imageUrl = uploaded.secure_url;
    }

    // =============================
    // Video → URL (YouTube, Vimeo o directo)
    // =============================
    if (dto.videoUrl) {
      const v = this.mediaService.saveVideoUrl(dto.videoUrl);
      videoUrl = v.url;
      videoProvider = v.provider;
    }

    // =============================
    // Determinar mediaType final
    // =============================
    if (imageUrl && videoUrl) mediaType = MediaType.MIXED;
    else if (imageUrl) mediaType = MediaType.IMAGE;
    else if (videoUrl) mediaType = MediaType.VIDEO;
    else mediaType = MediaType.TEXT;

    const testimonial = this.testimonialRepo.create({
      name: dto.name,
      content: dto.content,
      lastName: dto.lastName,
      authorPosition: dto.authorPosition ?? null,
      authorCompany: dto.authorCompany ?? null,
      authorEmail: dto.authorEmail ?? null,

      mediaType,
      imageUrl,
      videoUrl,
      videoPlatform: videoProvider,
      rating: dto.rating ?? null,
      testimonialDate: dto.testimonialDate ?? null,
      categoryId: invitation.categoryId,
      createdById: invitation.editorId,
      invitationId: invitation.id,
      status: TestimonialStatus.DRAFT,
    });

    return await this.testimonialRepo.save(testimonial);
  }

  // -------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------

  async update(id: string, userId: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException();
    if (testimonial.createdById !== userId) throw new ForbiddenException();

    if (
      [
        TestimonialStatus.PENDING_REVIEW,
        TestimonialStatus.APPROVED,
        TestimonialStatus.PUBLISHED,
      ].includes(testimonial.status)
    ) {
      throw new ForbiddenException('No editable en este estado');
    }

    Object.assign(testimonial, dto);
    return this.testimonialRepo.save(testimonial);
  }

  // -------------------------------------------------------
  // SUBMIT REVIEW
  // -------------------------------------------------------

  async submitForReview(id: string, userId: string) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException();
    if (testimonial.createdById !== userId) throw new ForbiddenException();

    if (
      testimonial.status !== TestimonialStatus.DRAFT &&
      testimonial.status !== TestimonialStatus.REJECTED
    ) {
      throw new ForbiddenException();
    }

    testimonial.status = TestimonialStatus.PENDING_REVIEW;
    testimonial.rejectionReason = null;
    return this.testimonialRepo.save(testimonial);
  }

  // -------------------------------------------------------
  // MODERATE
  // -------------------------------------------------------

  async moderate(id: string, adminId: string, dto: ModerateTestimonialDto) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException();

    if (dto.approved) {
      testimonial.status = TestimonialStatus.APPROVED;
      testimonial.reviewedById = adminId;
      testimonial.rejectionReason = null;
      testimonial.rejectedAt = null;
    } else {
      testimonial.status = TestimonialStatus.REJECTED;
      testimonial.reviewedById = adminId;
      testimonial.rejectionReason = dto.rejectionReason ?? null;
      testimonial.rejectedAt = new Date();
    }

    return this.testimonialRepo.save(testimonial);
  }

  // -------------------------------------------------------
  // PUBLISH / UNPUBLISH
  // -------------------------------------------------------

  async publish(id: string, adminId: string) {
    const testimonial = await this.testimonialRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!testimonial) {
      throw new NotFoundException();
    }

    // Solo se puede publicar si está aprobado
    if (testimonial.status !== TestimonialStatus.APPROVED) {
      throw new ForbiddenException(
        'Solo se pueden publicar testimonios aprobados',
      );
    }

    // Validar campos mínimos según tipo de contenido
    if (!testimonial.name || !testimonial.content) {
      throw new ForbiddenException(
        'El testimonio debe tener título y contenido antes de publicarse',
      );
    }

    if (testimonial.mediaType === MediaType.IMAGE && !testimonial.imageUrl) {
      throw new ForbiddenException(
        'El testimonio es de imagen pero no tiene una imagen',
      );
    }

    if (testimonial.mediaType === MediaType.VIDEO && !testimonial.videoUrl) {
      throw new ForbiddenException(
        'El testimonio es de video pero no tiene un videoUrl',
      );
    }

    testimonial.status = TestimonialStatus.PUBLISHED;
    testimonial.publishedAt = new Date();
    testimonial.reviewedById = adminId;

    await this.testimonialRepo.save(testimonial);

    return { message: 'Testimonio publicado correctamente' };
  }

  async unpublish(id: string, adminId: string) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });

    if (!testimonial) throw new NotFoundException();

    if (testimonial.status !== TestimonialStatus.PUBLISHED) {
      throw new ForbiddenException(
        'Solo se pueden despublicar testimonios publicados',
      );
    }

    testimonial.status = TestimonialStatus.APPROVED; // vuelve al aprobado
    testimonial.publishedAt = null;
    testimonial.reviewedById = adminId;

    return this.testimonialRepo.save(testimonial);
  }

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------

  async delete(id: string) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });

    if (!testimonial) throw new NotFoundException('Testimonio no encontrado');

    await this.testimonialRepo.remove(testimonial);

    return { message: 'Testimonio eliminado correctamente' };
  }

  // -------------------------------------------------------
  // MAPPER A DTO PÚBLICO
  // -------------------------------------------------------
  private toPublicDto(testimonial: Testimonial) {
    return {
      id: testimonial.id,
      name: testimonial.name,
      content: testimonial.content,

      lastName: testimonial.lastName,
      authorPosition: testimonial.authorPosition,
      authorCompany: testimonial.authorCompany,

      testimonialDate: testimonial.testimonialDate,

      mediaType: testimonial.mediaType,
      imageUrl: testimonial.imageUrl,
      videoUrl: testimonial.videoUrl,
      videoPlatform: testimonial.videoPlatform,

      rating: testimonial.rating,
      publishedAt: testimonial.publishedAt,

      category: testimonial.category
        ? {
            id: testimonial.category.id,
            name: testimonial.category.name,
            slug: testimonial.category.slug,
          }
        : null,
    };
  }
  // -------------------------------------------------------
  // MAPPER A DTO EDITOR
  // -------------------------------------------------------
  private toEditorDto(t: Testimonial): EditorTestimonialDto {
    return {
      ...this.toPublicDto(t),
      status: t.status,
      rejectionReason: t.rejectionReason,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  // -------------------------------------------------------
  // MAPPER A DTO ADMIN
  // -------------------------------------------------------
  private toAdminDto(t: Testimonial) {
    return {
      ...this.toEditorDto(t),
      createdBy: t.createdBy
        ? {
            id: t.createdBy.id,
            fullName: t.createdBy.fullName,
            email: t.createdBy.email,
          }
        : null,
    };
  }

  // -------------------------------------------------------
  // PUBLIC TESTIMONIALS
  // -------------------------------------------------------
  async getPublicTestimonials() {
    const items = await this.testimonialRepo.find({
      where: { status: TestimonialStatus.PUBLISHED },
      relations: ['category'],
      order: { publishedAt: 'DESC' },
    });

    return items.map((t) => this.toPublicDto(t));
  }

  // -------------------------------------------------------
  // GET ALL FOR EDITOR
  // -------------------------------------------------------
  async getAllForEditor(editorId: string): Promise<EditorTestimonialDto[]> {
    const list = await this.testimonialRepo.find({
      where: { createdById: editorId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    return list.map((t) => this.toEditorDto(t));
  }

  // -------------------------------------------------------
  // GET ONE FOR EDITOR
  // -------------------------------------------------------
  async getOneForEditor(id: string, editorId: string) {
    const testimonial = await this.testimonialRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonio no encontrado');
    }

    if (testimonial.createdById !== editorId) {
      throw new ForbiddenException(
        'No tienes permiso para ver este testimonio',
      );
    }

    return this.toEditorDto(testimonial);
  }

  async countForEditor(editorId: string) {
    return this.testimonialRepo.count({
      where: { createdById: editorId },
    });
  }

  async getAllForAdmin(filters?: {
    status?: TestimonialStatus;
    categoryId?: string;
  }) {
    const query = this.testimonialRepo
      .createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.category', 'category')
      .leftJoinAndSelect('testimonial.createdBy', 'createdBy')
      .orderBy('testimonial.createdAt', 'DESC');

    if (filters?.status)
      query.andWhere('testimonial.status = :status', {
        status: filters.status,
      });
    if (filters?.categoryId)
      query.andWhere('testimonial.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });

    const results = await query.getMany();
    return results.map((t) => this.toAdminDto(t));
  }
}
