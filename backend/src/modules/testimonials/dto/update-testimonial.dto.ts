import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { MediaType } from '../entities/testimonial.entity';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsString()
  authorPosition?: string;

  @IsOptional()
  @IsString()
  authorCompany?: string;

  @IsOptional()
  @IsEmail()
  authorEmail?: string;

  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoPlatform?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
