import { ApiProperty } from '@nestjs/swagger';

export class PublicTestimonialDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  authorPosition?: string | null;

  @ApiProperty({ required: false })
  authorCompany?: string | null;

  @ApiProperty()
  mediaType: string;

  @ApiProperty({ required: false })
  imageUrl?: string | null;

  @ApiProperty({ required: false })
  videoUrl?: string | null;

  @ApiProperty({ required: false })
  videoPlatform?: string | null;

  @ApiProperty({ required: false })
  rating?: number | null;

  @ApiProperty({
    required: false,
    description: 'Fecha del testimonio si fue provista',
  })
  testimonialDate?: Date | null;

  @ApiProperty({ required: false })
  publishedAt?: Date | null;

  @ApiProperty({
    required: false,
    description: 'Categoría pública del testimonio',
  })
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
