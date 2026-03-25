import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Testimonial } from './testimonial.entity';

@Entity('testimonial_invitations')
export class TestimonialInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Usuario editor que envió la invitación */
  @Column({ type: 'uuid' })
  editorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'editorId' })
  editor: User;

  /** Categoría para la cual se invitó a escribir el testimonio */
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  /** Correo de la persona invitada */
  @Column({ type: 'varchar', length: 255 })
  invitedEmail: string;

  /** Token único enviado al invitado */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  token: string;

  /** Marca si la invitación ya fue usada */
  @Column({ type: 'boolean', default: false })
  used: boolean;

  /** Fecha de uso del token */
  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  /** Relación 1:1 con Testimonial */
  @OneToOne(() => Testimonial, (t) => t.invitation, {
    cascade: true,
    nullable: true,
  })
  testimonial: Testimonial | null;

  @CreateDateColumn()
  createdAt: Date;

  /** (opcional) útil si editas la invitación o regeneras token */
  @UpdateDateColumn()
  updatedAt: Date;
}
