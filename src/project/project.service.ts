import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<string> {
    const { createdById, ...res } = createProjectDto;
    const createdBy = { id: createdById } satisfies DeepPartial<User>;
    const project = this.repository.create({
      ...res,
      createdBy,
    });
    const result = await this.repository.save(project);

    return result.id;
  }

  findAll(): Promise<Project[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<Project> {
    const existingProject = await this.repository.findOne({
      where: { id },
      relations: { createdBy: true },
    });

    if (!existingProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    return existingProject;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<void> {
    const result = await this.repository.update(id, updateProjectDto);

    if (!result.affected) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }
  }
}
