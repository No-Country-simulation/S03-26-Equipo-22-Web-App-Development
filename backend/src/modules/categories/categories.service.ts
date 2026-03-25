import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, description } = createCategoryDto;

    // Verificar si ya existe una categoría con ese nombre
    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${name}"`,
      );
    }

    const category = this.categoryRepository.create({
      name,
      description,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
    }

    return category;
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { id: In(ids) },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${updateCategoryDto.name}"`,
        );
      }
    }

    // Actualizar los campos
    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
    }

    // Si la categoría está activa → Soft delete (desactivar)
    if (category.isActive) {
      category.isActive = false;
      await this.categoryRepository.save(category);

      return {
        message: `Categoría "${category.name}" desactivada exitosamente`,
      };
    }

    // Si la categoría está inactiva → Hard delete (eliminar permanentemente)
    await this.categoryRepository.remove(category);

    return {
      message: `Categoría "${category.name}" eliminada permanentemente`,
    };
  }
}
