import { MediaType } from '../entities/testimonial.entity';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date.validator';

export class CompleteInvitationDto {
  @ApiProperty({
    example: 'jhon',
    description: 'nombre del author del testimonio',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Atención impecable, volvería a trabajar con ellos.',
    description: 'Contenido principal del testimonio',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del autor del testimonio',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'CTO', description: 'Cargo del autor' })
  @IsOptional()
  @IsString()
  authorPosition?: string;

  @ApiPropertyOptional({
    example: 'Google Inc.',
    description: 'Empresa del autor',
  })
  @IsOptional()
  @IsString()
  authorCompany?: string;

  @ApiPropertyOptional({
    example: 'juan@gmail.com',
    description: 'Email del autor (opcional)',
  })
  @IsOptional()
  @IsString()
  authorEmail?: string;

  @ApiPropertyOptional({
    enum: MediaType,
    example: MediaType.TEXT,
    description: 'Tipo de contenido del testimonio',
  })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({
    example: 'https://image.com/foto.jpg',
    description: 'Imagen asociada al testimonio',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com/video',
    description: 'URL del video si aplica',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: 'youtube',
    description: 'Plataforma del video (solo si aplica)',
  })
  @IsOptional()
  @IsString()
  videoPlatform?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Puntaje del testimonio (1-5)',
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description:
      'Fecha en la que se generó el testimonio (no puede ser futura)',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  @IsNotFutureDate({
    message: 'La fecha del testimonio no puede estar en el futuro.',
  })
  testimonialDate?: string;
}
