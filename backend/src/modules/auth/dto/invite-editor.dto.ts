
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
  IsUUID,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class InviteEditorDto {
  @ApiProperty({
    description: 'Email del editor a invitar',
    example: 'editor@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del editor',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MinLength(2, {
    message: 'El nombre completo debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre completo no puede exceder 100 caracteres',
  })
  fullName: string;

  @ApiProperty({
    description: 'IDs de las categorías asignadas al editor',
    example: ['uuid-categoria-1', 'uuid-categoria-2'],
    type: [String],
  })
  @IsArray({ message: 'Las categorías deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos una categoría' })
  @IsUUID('4', { each: true, message: 'Cada categoría debe ser un UUID válido' })
  categoryIds: string[];
}
