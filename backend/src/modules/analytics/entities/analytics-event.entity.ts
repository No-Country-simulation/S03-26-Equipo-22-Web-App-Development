import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  Index,
  Generated,
  ManyToOne,
} from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';

export enum EventType {
  VIEW = 'view',
  SHARE = 'share',
  LIKE = 'like',
  EMBED_LOAD = 'embed_load',
  CLICK = 'click',
}

@Entity('analytics_events')
@Index(['testimonialId', 'createdAt'])
export class AnalyticsEvent {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id!: string;

  @ManyToOne(() => Testimonial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testimonialId' })
  testimonial!: Testimonial;

  @Column({ type: 'uuid' })
  @Index()
  testimonialId!: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType!: EventType;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'text', nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referer!: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
