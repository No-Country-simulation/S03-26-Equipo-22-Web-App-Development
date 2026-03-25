import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EventType } from '../entities/analytics-event.entity';

export class RegisterEventDto {
  @ApiProperty({ example: 'a73af64e-cc6c-4025-9db7-09f607735d0c' })
  @IsUUID()
  testimonialId!: string;

  @ApiProperty({ enum: EventType, example: EventType.VIEW })
  @IsEnum(EventType)
  eventType!: EventType;

  @ApiProperty({
    required: false,
    description:
      'Optional client-side provided referer (backend may also capture automatically)',
  })
  @IsOptional()
  @IsString()
  referer?: string;

  @ApiProperty({
    required: false,
    description:
      'Optional client-side provided userAgent (backend may also capture automatically)',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
