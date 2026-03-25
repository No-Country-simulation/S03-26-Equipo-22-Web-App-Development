import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // Verificar si ya existe un tag ACTIVO con ese nombre
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name, isActive: true },
    });

    if (existingTag) {
      throw new ConflictException(
        `Ya existe un tag con el nombre "${createTagDto.name}"`,
      );
    }

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return await this.tagRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findAllForAdmin(): Promise<Tag[]> {
    return await this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tag> {
    if (!id) {
      throw new BadRequestException('El ID del tag es requerido');
    }

    const tag = await this.tagRepository.findOne({
      where: { id, isActive: true },
    });

    if (!tag) {
      throw new NotFoundException(`Tag con ID "${id}" no encontrado`);
    }

    return tag;
  }

  private async findById(id: string): Promise<Tag> {
    if (!id) {
      throw new BadRequestException('El ID del tag es requerido');
    }

    const tag = await this.tagRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag con ID "${id}" no encontrado`);
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);

    // Si se está actualizando el nombre, verificar que no exista otro tag ACTIVO con ese nombre
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, isActive: true },
      });

      if (existingTag) {
        throw new ConflictException(
          `Ya existe un tag con el nombre "${updateTagDto.name}"`,
        );
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<{ message: string }> {
    const tag = await this.findById(id);

    // Si el tag está activo → Soft delete (desactivar)
    if (tag.isActive) {
      tag.isActive = false;
      await this.tagRepository.save(tag);

      return {
        message: `Tag "${tag.name}" desactivado exitosamente`,
      };
    }

    // Si el tag está inactivo → Hard delete (eliminar permanentemente)
    await this.tagRepository.remove(tag);

    return {
      message: `Tag "${tag.name}" eliminado permanentemente`,
    };
  }
}
