import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';
import { ModerationHistory } from '../../moderation/entities/moderation-history.entity';
import { Category } from '../../categories/entities/category.entity';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EDITOR,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  // Relaciones
  @OneToMany(() => Testimonial, (testimonial) => testimonial.createdBy)
  createdTestimonials: Testimonial[];

  @OneToMany(() => Testimonial, (testimonial) => testimonial.reviewedBy)
  reviewedTestimonials: Testimonial[];

  @OneToMany(() => ModerationHistory, (history) => history.reviewer)
  moderationActions: ModerationHistory[];

  @ManyToMany(() => Category, { eager: true })
  @JoinTable({
    name: 'user_categories',
    joinColumn: { name: 'userid', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryid', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
