import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una nueva API Key
 * Solo el ADMIN puede crear API keys
 */
export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Nombre del cliente que usará la API key',
    example: 'TechCorp Industries',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'El nombre del cliente debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  clientName: string;

  @ApiPropertyOptional({
    description:
      'Lista de dominios permitidos (opcional). Si no se especifica, cualquier dominio puede usar la API key',
    example: ['techcorp.com', 'www.techcorp.com'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los dominios deben ser un array' })
  @IsString({ each: true, message: 'Cada dominio debe ser texto' })
  allowedDomains?: string[];

  @ApiPropertyOptional({
    description: 'Fecha de expiración de la API key (opcional)',
    example: '2025-12-31T23:59:59.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de expiración debe ser una fecha válida' })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Descripción o notas sobre esta API key',
    example: 'API key para el sitio corporativo principal',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, {
    message: 'La descripción no puede tener más de 500 caracteres',
  })
  description?: string;

  @ApiPropertyOptional({
    description:
      'Categorías a las que estará limitada la API key. Si se omite o está vacío, la key es de alcance "all".',
    example: ['9c89ba04-d9ec-46f1-a11f-77423f51bd28', 'b8f7a6b2-6c7d-4f8c-9e0d-2d1a3b4c5d6e'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsUUID('4', { each: true, message: 'Cada categoría debe ser un UUID v4 válido' })
  categoryIds?: string[];
}
