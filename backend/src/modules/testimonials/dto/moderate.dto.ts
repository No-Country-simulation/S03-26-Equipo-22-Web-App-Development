import { IsBoolean, IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class ModerateTestimonialDto {
  @IsBoolean()
  approved: boolean;

  @ValidateIf((o: ModerateTestimonialDto) => o.approved === false)
  @IsString()
  @IsNotEmpty()
  rejectionReason?: string;
}
