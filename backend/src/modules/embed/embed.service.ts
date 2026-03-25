import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EmbedApiKey } from './entities/embed-api-key.entity';
import {
  Testimonial,
  TestimonialStatus,
} from '../testimonials/entities/testimonial.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import {
  PublicTestimonialDto,
  TestimonialFilters,
} from './interfaces/embed.interface';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class EmbedService {
  constructor(
    @InjectRepository(EmbedApiKey)
    private readonly apiKeyRepo: Repository<EmbedApiKey>,

    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly configService: ConfigService,
  ) {}

  /**
   * VALIDAR API KEY
   * Devuelve la entidad encontrada (con sus categorias) o null si no es válida
   */
  async validateApiKey(apiKey: string): Promise<EmbedApiKey | null> {
    if (!apiKey) return null;

    const key = await this.apiKeyRepo.findOne({
      where: { apiKey, isActive: true },
      relations: ['categories'],
    });

    if (!key) return null;
    if (key.expiresAt && new Date() > key.expiresAt) return null;

    return key;
  }

  /**
   * OBTENER TESTIMONIOS PUBLICOS
   * Usa SQL crudo para mapear columnas reales (name/lastName) sin requerir title/authorName en BD
   */
  async getPublicTestimonials(
    filters: TestimonialFilters,
  ): Promise<PublicTestimonialDto[]> {
    const params: any[] = [TestimonialStatus.PUBLISHED];
    let sql = `
      SELECT
        t.id,
        t.name,
        t."lastName",
        t.content,
        t."authorPosition",
        t."authorCompany",
        t.rating,
        t."imageUrl",
        t."videoUrl",
        t."publishedAt",
        c.id AS "categoryId",
        c.name AS "categoryName",
        c.slug AS "categorySlug"
      FROM testimonials t
      LEFT JOIN categories c ON c.id = t."categoryId"
      WHERE t.status = $1
    `;

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const placeholders = filters.categoryIds
        .map((_, idx) => `$${params.length + idx + 1}`)
        .join(', ');
      sql += ` AND t."categoryId" IN (${placeholders})`;
      params.push(...filters.categoryIds);
    } else if (filters.categorySlug) {
      sql += ` AND c.slug = $${params.length + 1}`;
      params.push(filters.categorySlug);
    }

    sql += ` ORDER BY t."publishedAt" DESC NULLS LAST, t."createdAt" DESC LIMIT $${params.length + 1}`;
    params.push(filters.limit);

    const rows = await this.testimonialRepo.query(sql, params);

    return rows.map((r: any) => {
      const fullName =
        (r.lastName && String(r.lastName).trim()) ||
        (r.name && String(r.name).trim()) ||
        'Testimonio';

      return {
        id: r.id,
        // Preferimos usar la columna name como título; si no hay, cargo/empresa; si no, extracto de contenido
        title:
          (r.name && String(r.name).trim()) ||
          r.authorPosition ||
          r.authorCompany ||
          (r.content ? String(r.content).slice(0, 90) : 'Testimonio'),
        content: r.content,
        authorName: fullName,
        authorPosition: r.authorPosition || null,
        authorCompany: r.authorCompany || null,
        rating: r.rating ?? null,
        imageUrl: r.imageUrl || null,
        videoUrl: r.videoUrl || null,
        publishedAt: r.publishedAt,
        category: r.categoryId
          ? {
              id: r.categoryId,
              name: r.categoryName,
              slug: r.categorySlug,
            }
          : null,
      };
    });
  }

  /**
   * GENERAR CODIGO JAVASCRIPT
   * Crea el script que los clientes copian y pegan en sus sitios
   */
  generateEmbedScript(): string {
    const apiUrl =
      this.configService.get<string>('environment') === 'production'
        ? 'https://edtech-equipo-02.onrender.com'
        : 'http://localhost:3001';

    return `
/**
 * Testimonials Widget - Carrusel
 * Generado automaticamente - No editar
 */
(function() {
  'use strict';

  const API_URL = '${apiUrl}/embed/testimonials';
  const state = { testimonials: [], index: 0, visible: 3, container: null };

  function loadTestimonials(apiKey, options = {}) {
    if (!apiKey) {
      console.error('[TestimonialsWidget] Error: API key es requerida');
      return;
    }

    state.visible = Math.max(1, options.visible || 3);
    const containerId = options.containerId || 'testimonials-widget';
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[TestimonialsWidget] Error: No se encontro el contenedor #' + containerId);
      return;
    }
    state.container = container;
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;">Cargando testimonios...</div>';

    let url = API_URL;
    const params = new URLSearchParams();
    if (options.categories) params.append('categories', toCsv(options.categories));
    else if (options.category) params.append('category', options.category);
    if (options.limit) params.append('limit', options.limit);
    params.append('format', 'json');
    if (params.toString()) url += '?' + params.toString();

    fetch(url, { headers: { 'X-API-Key': apiKey } })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar testimonios: ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;">No hay testimonios disponibles</div>';
          return;
        }
        state.testimonials = data;
        state.index = 0;
        render();
      })
      .catch((err) => {
        console.error('[TestimonialsWidget] Error:', err);
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#dc2626;">Error al cargar testimonios</div>';
      });
  }

  function render() {
    const container = state.container;
    const total = state.testimonials.length;
    if (!container || total === 0) return;

    const visible = Math.min(state.visible, total);
    const cards = [];
    for (let i = 0; i < visible; i++) {
      const t = state.testimonials[(state.index + i) % total];
      cards.push(cardHtml(t));
    }

    container.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;justify-content:center;">' +
        '<button class="tw-prev" aria-label="Anterior" style="width:48px;height:48px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.08);cursor:pointer;font-size:20px;color:#4b5563;">&larr;</button>' +
        '<div style="display:flex;flex-wrap:nowrap;gap:20px;overflow:hidden;">' + cards.join('') + '</div>' +
        '<button class="tw-next" aria-label="Siguiente" style="width:48px;height:48px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.08);cursor:pointer;font-size:20px;color:#4b5563;">&rarr;</button>' +
      '</div>';

    const prevBtn = container.querySelector('.tw-prev');
    const nextBtn = container.querySelector('.tw-next');
    prevBtn.onclick = () => { state.index = (state.index - visible + total) % total; render(); };
    nextBtn.onclick = () => { state.index = (state.index + visible) % total; render(); };
  }

  function cardHtml(t) {
    const hasMedia = t.imageUrl || t.videoUrl;
    const initials = (t.authorName || '').trim().split(/\\s+/).map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';

    return (
      '<div style="flex:0 0 360px;max-width:360px;min-width:300px;min-height:520px;background:#fff;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.08);border:1px solid #e5e7eb;overflow:hidden;display:flex;flex-direction:column;">' +
        '<div style="display:flex;align-items:center;gap:12px;padding:18px 18px 0 18px;">' +
          '<div style="width:48px;height:48px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4b5563;font-size:18px;flex-shrink:0;">' + initials + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:15px;font-weight:700;color:#111827;line-height:1.3;">' + escapeHtml(t.authorName || '') + '</div>' +
            '<div style="font-size:13px;color:#6b7280;line-height:1.4;">' +
              (t.authorPosition ? escapeHtml(t.authorPosition) : '') +
              (t.authorCompany ? (t.authorPosition ? ' · ' : '') + escapeHtml(t.authorCompany) : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        (t.rating ? '<div style="font-size:17px;color:#f59e0b;letter-spacing:1px;padding:8px 18px 0 18px;">' + '★'.repeat(t.rating) + '</div>' : '<div style="height:8px;"></div>') +
        '<div style="flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 18px 0 18px;overflow:hidden;">' +
          '<h3 style="font-size:18px;font-weight:700;color:#111827;margin:0;line-height:1.3;">' + escapeHtml(t.title || '') + '</h3>' +
          '<p style="color:#4b5563;line-height:1.6;font-size:14px;margin:0;">' + escapeHtml(t.content || '') + '</p>' +
        '</div>' +
        (hasMedia
          ? '<div style="width:100%;padding:0 18px 0 18px;box-sizing:border-box;border-top:1px solid #f3f4f6;flex-shrink:0;">' +
              '<div style="width:100%;height:200px;border-radius:12px;overflow:hidden;background:#f9fafb;">' + mediaEmbed(t) + '</div>' +
            '</div>'
          : '<div style="height:12px;border-top:1px solid #f3f4f6;"></div>') +
        '<div style="display:flex;justify-content:flex-start;align-items:center;gap:12px;padding:10px 18px 14px 18px;border-top:1px solid #f3f4f6;">' +
          (t.category ? '<span style="background:#f3f4f6;color:#6b7280;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:600;">' + escapeHtml(t.category.name) + '</span>' : '<span></span>') +
        '</div>' +
      '</div>'
    );
  }

  function mediaEmbed(t) {
    if (t.videoUrl) {
      const url = t.videoUrl;
      // Detectar YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        // youtube.com/watch?v=VIDEO_ID
        if (url.includes('youtube.com/watch')) {
          const params = new URLSearchParams(url.split('?')[1] || '');
          videoId = params.get('v') || '';
        }
        // youtu.be/VIDEO_ID
        else if (url.includes('youtu.be/')) {
          const parts = url.split('youtu.be/')[1];
          videoId = parts ? parts.split(/[?&]/)[0] : '';
        }
        // youtube.com/shorts/VIDEO_ID
        else if (url.includes('youtube.com/shorts/')) {
          const parts = url.split('youtube.com/shorts/')[1];
          videoId = parts ? parts.split(/[?&]/)[0] : '';
        }
        if (videoId && videoId.length === 11) {
          return '<iframe src="https://www.youtube.com/embed/' + escapeAttr(videoId) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>';
        }
      }
      // Detectar Vimeo
      if (url.includes('vimeo.com')) {
        const match = url.match(/vimeo\\.com\\/(\\d+)/);
        const videoId = match ? match[1] : '';
        if (videoId) {
          return '<iframe src="https://player.vimeo.com/video/' + escapeAttr(videoId) + '" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>';
        }
      }
      // Video directo (fallback)
      return '<video src="' + escapeAttr(url) + '" controls controlsList="nodownload" preload="metadata" style="width:100%;height:100%;object-fit:cover;border-radius:12px;background:#000;"></video>';
    }
    return '<img src="' + escapeAttr(t.imageUrl || '') + '" alt="' + escapeAttr(t.authorName || 'Media') + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">';
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
  }

  function toCsv(val) {
    if (Array.isArray(val)) return val.map((c) => (c || '').trim()).filter(Boolean).join(',');
    if (typeof val === 'string') return val;
    return '';
  }

  window.TestimonialsWidget = { load: loadTestimonials, version: '1.1.0' };
})();
`;
  }

  /**
   * CREAR API KEY (solo ADMIN)
   */
  async createApiKey(
    dto: CreateApiKeyDto,
    userId: string,
  ): Promise<EmbedApiKey> {
    // Validar categorias si se envian (multi)
    let categories: Category[] = [];
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const uniqueIds = Array.from(new Set(dto.categoryIds));
      categories = await this.categoryRepo.find({ where: { id: In(uniqueIds) } });
      if (categories.length !== uniqueIds.length) {
        throw new BadRequestException('Alguna categoria no existe');
      }
    }

    const apiKey = 'emb_' + crypto.randomBytes(24).toString('hex');

    const newKey = this.apiKeyRepo.create({
      apiKey,
      clientName: dto.clientName,
      allowedDomains: dto.allowedDomains || null,
      expiresAt: dto.expiresAt || null,
      description: dto.description || null,
      userId,
      isActive: true,
      categories,
    });

    return await this.apiKeyRepo.save(newKey);
  }

  /**
   * LISTAR API KEYS (solo ADMIN)

   */
  async listApiKeys(): Promise<EmbedApiKey[]> {
    return await this.apiKeyRepo.find({
      relations: ['createdBy', 'categories'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ELIMINAR API KEY (solo ADMIN)
   */
  async revokeApiKey(id: string): Promise<{ message: string }> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException('API key no encontrada');
    }

    // Eliminación permanente directa
    await this.apiKeyRepo.remove(apiKey);

    return {
      message: `API key de "${apiKey.clientName}" eliminada exitosamente`,
    };
  }
}




