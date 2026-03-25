import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialInvitation } from './entities/invitation.entity';
import { Category } from '../categories/entities/category.entity';
import { EmailModule } from '../email/email.module';
import { MediaModule } from '../media/media.module'; // 👈 NECESARIO

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial, TestimonialInvitation, Category]),
    EmailModule,
    MediaModule, // ⬅️ agregar aquí
  ],
  providers: [TestimonialsService],
  controllers: [TestimonialsController],
})
export class TestimonialsModule {}
