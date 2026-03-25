import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Generated,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { TestimonialInvitation } from './invitation.entity';

export enum TestimonialStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

export enum MediaType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  MIXED = 'mixed',
}

@Entity('testimonials')
export class Testimonial {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorPosition: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorCompany: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorEmail: string | null;

  @Column({ type: 'timestamp', nullable: true })
  testimonialDate: Date | null;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.TEXT,
  })
  mediaType: MediaType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  videoPlatform: string | null;

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    enumName: 'testimonial_status_enum',
    default: TestimonialStatus.DRAFT,
  })
  status: TestimonialStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'int', nullable: false })
  rating: number | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => Category, (category) => category.testimonials, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User;

  @Column({ type: 'uuid', nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => TestimonialInvitation, (inv) => inv.testimonial, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'invitationId' })
  invitation: TestimonialInvitation;

  @Column({ type: 'uuid', nullable: true })
  invitationId: string | null;

  @ManyToMany(() => Tag, (tag) => tag.testimonials, { cascade: true })
  @JoinTable({
    name: 'testimonial_tags',
    joinColumn: { name: 'testimonialId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
