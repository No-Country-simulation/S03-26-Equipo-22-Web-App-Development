import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, EventType } from './entities/analytics-event.entity';
import { RegisterEventDto } from './dto/register-event.dto';
import { Request } from 'express';
import { extractRequestInfo } from './helpers/request-info.helper';
import { AnalyticsEventsQueryDto } from './dto/analytics-events-query.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepo: Repository<AnalyticsEvent>,
  ) {}

  /**
   * 🔹 Registrar evento (PÚBLICO)
   */
  async registerEvent(dto: RegisterEventDto, req?: Request) {
    try {
      const info = req ? extractRequestInfo(req) : null;

      const ev = this.analyticsRepo.create({
        testimonialId: dto.testimonialId,
        eventType: dto.eventType,
        ipAddress: info?.ipAddress ?? null,
        referer: dto.referer ?? info?.referer ?? null,
        userAgent: dto.userAgent ?? info?.userAgent ?? null,
      } as Partial<AnalyticsEvent>);

      return await this.analyticsRepo.save(ev);
    } catch (err: unknown) {
      this.logger.error('Error guardando evento analytics', err);
      throw new InternalServerErrorException('No se pudo registrar el evento');
    }
  }

  /**
   * 📊 Stats por testimonio
   */
  async getStatsByTestimonial(testimonialId: string) {
    type Row = { eventType: EventType; count: string };

    const rows = await this.analyticsRepo
      .createQueryBuilder('e')
      .select('e.eventType', 'eventType')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.testimonialId = :testimonialId', { testimonialId })
      .groupBy('e.eventType')
      .getRawMany<Row>();

    return {
      testimonialId,
      total: rows.reduce((a, b) => a + Number(b.count), 0),
      counts: Object.fromEntries(
        rows.map((r) => [r.eventType, Number(r.count)]),
      ) as Partial<Record<EventType, number>>,
    };
  }

  /**
   * 🌎 Estadísticas globales (totales + ranking)
   */
  async getGlobalStats(options?: { top?: number }) {
    const limit = options?.top ?? 10;

    type TotalsRow = { eventType: EventType; count: string };
    type TopRow = { testimonialId: string; views: string; likes: string };

    const totalsRaw = await this.analyticsRepo
      .createQueryBuilder('e')
      .select('e.eventType', 'eventType')
      .addSelect('COUNT(e.id)', 'count')
      .groupBy('e.eventType')
      .getRawMany<TotalsRow>();

    const topRaw = await this.analyticsRepo
      .createQueryBuilder('e')
      .select('e.testimonialId', 'testimonialId')
      .addSelect("COUNT(*) FILTER (WHERE e.eventType = 'view')", 'views')
      .addSelect("COUNT(*) FILTER (WHERE e.eventType = 'like')", 'likes')
      .groupBy('e.testimonialId')
      .orderBy('views', 'DESC')
      .limit(limit)
      .getRawMany<TopRow>();

    return {
      totals: Object.fromEntries(
        totalsRaw.map((r) => [r.eventType, Number(r.count)]),
      ) as Record<EventType, number>,

      topTestimonials: topRaw.map((r) => ({
        testimonialId: r.testimonialId,
        views: Number(r.views),
        likes: Number(r.likes),
      })),
    };
  }

  /**
   * 📈 Trends diarios globales (AVANZADO)
   * Incluye: views, likes, shares, clicks, embeds
   */
  async getGlobalDailyTrends(days = 14) {
    type RawRow = {
      day: Date;
      views: string;
      likes: string;
      shares: string;
      clicks: string;
      embeds: string;
    };

    const rows = await this.analyticsRepo.query<RawRow[]>(
      `
    SELECT
      DATE_TRUNC('day', "createdAt") AS day,
      COUNT(*) FILTER (WHERE "eventType" = 'view')        AS views,
      COUNT(*) FILTER (WHERE "eventType" = 'like')        AS likes,
      COUNT(*) FILTER (WHERE "eventType" = 'share')       AS shares,
      COUNT(*) FILTER (WHERE "eventType" = 'click')       AS clicks,
      COUNT(*) FILTER (WHERE "eventType" = 'embed_load')  AS embeds
    FROM analytics_events
    WHERE "createdAt" >= NOW() - ($1 || ' days')::interval
    GROUP BY day
    ORDER BY day ASC
    `,
      [days],
    );

    return rows.map((r) => ({
      date: r.day.toISOString().split('T')[0],
      views: Number(r.views),
      likes: Number(r.likes),
      shares: Number(r.shares),
      clicks: Number(r.clicks),
      embeds: Number(r.embeds),
    }));
  }

  async getAnalyticsEvents(query: AnalyticsEventsQueryDto) {
    const { testimonialId, eventType, from, to, page = 1, limit = 20 } = query;

    const qb = this.analyticsRepo.createQueryBuilder('e');

    if (testimonialId) {
      qb.andWhere('e.testimonialId = :testimonialId', { testimonialId });
    }

    if (eventType) {
      qb.andWhere('e.eventType = :eventType', { eventType });
    }

    if (from) {
      qb.andWhere('e.createdAt >= :from', { from });
    }

    if (to) {
      qb.andWhere('e.createdAt <= :to', { to });
    }

    qb.orderBy('e.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((e) => ({
        id: e.id,
        testimonialId: e.testimonialId,
        eventType: e.eventType,
        referer: e.referer,
        userAgent: e.userAgent,
        ipAddress: e.ipAddress,
        createdAt: e.createdAt,
      })),
      total,
      page,
      limit,
    };
  }
  /**
   * 📅 Eventos diarios por testimonio
   */
  async getDailyCountsForTestimonial(testimonialId: string, days = 7) {
    type Row = { day: Date; eventType: EventType; count: string };

    const rows = await this.analyticsRepo
      .createQueryBuilder('e')
      .select("DATE_TRUNC('day', e.createdAt)", 'day')
      .addSelect('e.eventType', 'eventType')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.testimonialId = :testimonialId', { testimonialId })
      .andWhere("e.createdAt >= NOW() - (:days || ' days')::interval", { days })
      .groupBy("DATE_TRUNC('day', e.createdAt)")
      .addGroupBy('e.eventType')
      .orderBy('day', 'ASC')
      .getRawMany<Row>();

    return rows.map((r) => ({
      day: r.day,
      eventType: r.eventType,
      count: Number(r.count),
    }));
  }
}
