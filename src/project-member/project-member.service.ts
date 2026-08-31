import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../project/entities/project.entity';
import { MemberRole } from '../common/enums';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly repository: Repository<ProjectMember>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(projectId: string, projectMembersDto: CreateProjectMemberDto[]) {
    const targetProject = await this.projectRepository.findOneBy({
      id: projectId,
    });

    if (!targetProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    const newMembers = projectMembersDto.map((v) => {
      return this.repository.create({
        projectId,
        userId: v.userId,
        role: MemberRole.Member,
      });
    });

    await this.repository.save(newMembers);
  }

  async findAll(projectId: string) {
    const targetProject = await this.projectRepository.findOneBy({
      id: projectId,
    });

    if (!targetProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    return await this.repository.findBy({ projectId });
  }

  async remove(projectId: string, memberId: string) {
    const targetProject = await this.projectRepository.findOneBy({
      id: projectId,
    });

    if (!targetProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    const result = await this.repository.delete({
      projectId,
      userId: memberId,
    });

    if (!result.affected) {
      throw new NotFoundException('존재하지 않는 멤버 입니다.');
    }
  }
}
