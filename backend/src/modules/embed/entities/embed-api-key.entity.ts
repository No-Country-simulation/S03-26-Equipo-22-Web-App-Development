import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

/**
 * Entidad para almacenar las API Keys de clientes externos
 * que quieren integrar testimonios en sus sitios web
 */
@Entity('embed_api_keys')
export class EmbedApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Clave única de acceso (se genera aleatoriamente)
   * Ejemplo: "emb_1a2b3c4d5e6f7g8h9i0j"
   */
  @Column({ type: 'varchar', length: 64, unique: true })
  apiKey: string;

  /**
   * Nombre del cliente que usará esta API key
   * Ejemplo: "TechCorp Industries"
   */
  @Column({ type: 'varchar', length: 255 })
  clientName: string;

  /**
   * Dominios permitidos para usar esta API key
   * Ejemplo: ["techcorp.com", "www.techcorp.com"]
   * NULL = cualquier dominio puede usarla
   */
  @Column({ type: 'simple-array', nullable: true })
  allowedDomains: string[] | null;

  /**
   * Si la API key está activa o desactivada
   * false = revocada/desactivada
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Fecha de creación de la API key
   */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /**
   * Fecha de expiración (opcional)
   * NULL = nunca expira
   */
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  /**
   * Usuario admin que creó esta API key
   */
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  createdBy: User;

  /**
   * Descripción opcional de la API key
   * Ejemplo: "API key para sitio corporativo de TechCorp"
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /**
   * Categorías asociadas a la API key.
   * Sin categorías = acceso a todas (scope "all").
   * Una o más categorías = filtrado fijo a esas categorías.
   */
  @ManyToMany(() => Category, { nullable: true })
  @JoinTable({
    name: 'embed_api_keys_categories',
    joinColumn: { name: 'apiKeyId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories?: Category[];
}
