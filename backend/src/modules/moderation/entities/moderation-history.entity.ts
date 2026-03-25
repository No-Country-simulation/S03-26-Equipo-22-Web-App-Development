import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import {
  Testimonial,
  TestimonialStatus,
} from '../../testimonials/entities/testimonial.entity';
import { User } from '../../users/entities/user.entity';

@Entity('moderation_history')
export class ModerationHistory {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @JoinColumn({ name: 'testimonialId' })
  testimonial: Testimonial;

  @Column({ type: 'uuid' })
  testimonialId: string;

  @ManyToOne(() => User, (user) => user.moderationActions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'uuid', nullable: true })
  reviewerId: string;

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    enumName: 'testimonial_status_enum',
    nullable: true,
  })
  previousStatus: TestimonialStatus;

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    enumName: 'testimonial_status_enum',
  })
  newStatus: TestimonialStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
