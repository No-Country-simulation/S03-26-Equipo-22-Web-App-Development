import { ApiProperty } from '@nestjs/swagger';
import { PublicTestimonialDto } from './public-testimonial.dto';

export class EditorTestimonialDto extends PublicTestimonialDto {
  @ApiProperty({
    description: 'Estado del testimonio (DRAFT/REJECTED/APPROVED/PUBLISHED)',
  })
  status: string;

  @ApiProperty({ required: false, description: 'Motivo si fue rechazado' })
  rejectionReason?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
