import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../user/entities/user.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { MemberRole, ProjectStatus } from '../common/enums';
import { ProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Project);

      const { status, createdById, ...res } = createProjectDto;
      const createdBy = { id: createdById } satisfies DeepPartial<User>;
      const project = repository.create({
        ...res,
        status: status ?? ProjectStatus.Planned,
        createdBy,
      });
      const savedProject = await repository.save(project);

      const memberRepository = manager.getRepository(ProjectMember);

      const owner = memberRepository.create({
        projectId: savedProject.id,
        // TODO: DTO에서 createdById 없애고 로그인 사용자 아이디로 대체하기
        userId: createdById,
        role: MemberRole.Owner,
      });
      await memberRepository.save(owner);

      return savedProject.id;
    });
  }

  findAll(): Promise<Project[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<ProjectDto> {
    const existingProject = await this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: { createdBy: true, members: { user: true } },
    });

    if (!existingProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    return {
      ...existingProject,
      members:
        existingProject.members?.map((v) => ({
          userId: v.userId,
          role: v.role,
          name: v.user?.name,
        })) ?? [],
    };
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
