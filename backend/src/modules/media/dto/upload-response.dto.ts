import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'ID público generado por Cloudinary',
    example: 'samples/testimonials/abcd1234xyz',
  })
  public_id: string;

  @ApiProperty({
    description: 'URL segura HTTPS del archivo subido',
    example:
      'https://res.cloudinary.com/demo/image/upload/v123456789/sample.png',
  })
  secure_url: string;

  @ApiProperty({
    description: 'Nombre del archivo original subido por el usuario',
    example: 'foto_perfil.png',
    required: false,
  })
  original_filename?: string;

  @ApiProperty({
    description: 'Tipo de recurso subido',
    example: 'image',
    enum: ['image', 'video'],
  })
  resource_type: string;

  @ApiProperty({
    description: 'Ancho de la imagen (solo si aplica)',
    example: 1080,
    required: false,
  })
  width?: number;

  @ApiProperty({
    description: 'Altura de la imagen (solo si aplica)',
    example: 1080,
    required: false,
  })
  height?: number;

  @ApiProperty({
    description: 'Peso del archivo en bytes',
    example: 340291,
    required: false,
  })
  bytes?: number;
}
