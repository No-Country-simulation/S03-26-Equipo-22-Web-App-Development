import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Category } from '../categories/entities/category.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    categoryIds?: string[];
  }): Promise<User> {
    // Verificar si ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    let categories: Category[] = [];

    // Si vienen categorías
    if (data.categoryIds && data.categoryIds.length > 0) {
      categories = await this.categoryRepository.find({
        where: { id: In(data.categoryIds) },
      });

      if (categories.length !== data.categoryIds.length) {
        throw new BadRequestException('Una o más categorías no existen');
      }
    }

    const user = this.userRepository.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
      isActive: true,
      isEmailVerified: true,
      categories,
    });

    return await this.userRepository.save(user);
  }
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: [
        'id',
        'email',
        'fullName',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      relations: ['categories'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'fullName',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      user.passwordHash = passwordHash;
      delete updateUserDto.password;
    }

    // Si se actualizan las categorías
    if (updateUserDto.categoryIds) {
      const categories = await this.categoryRepository.find({
        where: { id: In(updateUserDto.categoryIds) },
      });

      if (categories.length !== updateUserDto.categoryIds.length) {
        throw new BadRequestException('Una o más categorías no existen');
      }

      user.categories = categories;
      delete updateUserDto.categoryIds;
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si el usuario está activo → Soft delete (desactivar)
    if (user.isActive) {
      user.isActive = false;
      await this.userRepository.save(user);

      return {
        message: `Usuario "${user.fullName}" desactivado exitosamente`,
      };
    }

    // Si el usuario está inactivo → Hard delete (eliminar permanentemente)
    await this.userRepository.remove(user);

    return {
      message: `Usuario "${user.fullName}" eliminado permanentemente`,
    };
  }
}
