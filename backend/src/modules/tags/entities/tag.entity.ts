import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relaciones
  @ManyToMany(() => Testimonial, (testimonial) => testimonial.tags)
  testimonials: Testimonial[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug(): void {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quita acentos
        .replace(/[^a-z0-9\s-]/g, '') // Quita caracteres especiales
        .trim()
        .replace(/\s+/g, '-'); // Espacios → guiones
    }
  }
}
