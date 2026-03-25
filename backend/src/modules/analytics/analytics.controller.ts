import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RegisterEventDto } from './dto/register-event.dto';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { AnalyticsEventsQueryDto } from './dto/analytics-events-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 📍 Endpoint PÚBLICO
   * Captura eventos desde frontend (views, likes, shares, etc)
   */
  @Public()
  @Post()
  @ApiOperation({ summary: 'Registrar evento de analytics (PÚBLICO)' })
  @ApiBody({ type: RegisterEventDto })
  @ApiResponse({ status: 201, description: 'Evento registrado' })
  async registerEvent(@Body() dto: RegisterEventDto, @Req() req: Request) {
    return this.analyticsService.registerEvent(dto, req);
  }

  /**
   * 🔐 Solo Admin — estadísticas por testimonial
   */
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('testimonial/:id/stats')
  @ApiOperation({ summary: 'Estadísticas de un testimonial (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del testimonial' })
  async getStats(@Param('id') id: string) {
    return this.analyticsService.getStatsByTestimonial(id);
  }

  /**
   * 🔐 Solo Admin — métricas globales + trends
   */
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('global')
  @ApiOperation({
    summary: 'Estadísticas globales (ADMIN)',
    description: 'Totales globales, top testimonials y trends diarios',
  })
  @ApiQuery({
    name: 'top',
    required: false,
    description: 'Cantidad de testimonials top (default 10)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Cantidad de días para trends (default 14)',
  })
  async getGlobal(@Query('top') top?: string, @Query('days') days?: string) {
    const topN = top ? parseInt(top, 10) : undefined;
    const daysN = days ? parseInt(days, 10) : 14;

    const globalStats = await this.analyticsService.getGlobalStats({
      top: topN,
    });

    const trends = await this.analyticsService.getGlobalDailyTrends(daysN);

    return {
      ...globalStats,
      trends,
    };
  }

  /**
   * 🔐 Solo Admin — eventos diarios de un testimonial
   */
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('testimonial/:id/daily')
  @ApiOperation({
    summary: 'Eventos diarios de un testimonial (ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'ID del testimonial' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Cantidad de días (default 7)',
  })
  async getDaily(@Param('id') id: string, @Query('days') days?: string) {
    const d = days ? parseInt(days, 10) : 7;
    return this.analyticsService.getDailyCountsForTestimonial(id, d);
  }
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('events')
  @ApiOperation({ summary: 'Listado de eventos analytics (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de eventos analytics' })
  async getEvents(@Query() query: AnalyticsEventsQueryDto) {
    return this.analyticsService.getAnalyticsEvents(query);
  }
}
