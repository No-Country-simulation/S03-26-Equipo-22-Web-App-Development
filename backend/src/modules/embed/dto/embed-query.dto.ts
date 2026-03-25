import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para los parámetros de consulta del endpoint público de embed
 * Permite filtrar testimonios por categoría y limitar cantidad
 */
export class EmbedQueryDto {
  @ApiPropertyOptional({
    description: 'Slug de la categoría para filtrar testimonios',
    example: 'producto',
  })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de testimonios a devolver',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Formato de respuesta: json (por defecto) o html',
    example: 'json',
    enum: ['json', 'html'],
  })
  @IsOptional()
  @IsString()
  format?: 'json' | 'html' = 'json';
}
