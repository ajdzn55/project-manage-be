import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../user/entities/user.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { MemberRole, ProjectStatus, TaskStatus } from '../common/enums';
import { DailyCompletedCounts, ProjectDto } from './dto/project.dto';
import { Task } from '../task/entities/task.entity';
import dayjs from 'dayjs';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Project);

      const { status, ...res } = createProjectDto;
      const createdBy = { id: userId } satisfies DeepPartial<User>;
      const project = repository.create({
        ...res,
        status: status ?? ProjectStatus.Planned,
        createdBy,
      });
      const savedProject = await repository.save(project);

      const memberRepository = manager.getRepository(ProjectMember);

      const owner = memberRepository.create({
        projectId: savedProject.id,
        userId,
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

    const queryBuilder = this.taskRepository
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.project', 'p')
      .where('t.project_id = :projectId', { projectId: existingProject.id });

    // 상태별 건수 계산
    const tasks = await queryBuilder.getMany();
    const totalCount = tasks.length;
    const todoCount = tasks?.filter((v) => v.status === TaskStatus.Todo).length;
    const inProgressCount = tasks?.filter(
      (v) => v.status === TaskStatus.InProgress,
    ).length;
    const doneCount = tasks?.filter((v) => v.status === TaskStatus.Done).length;

    // 완료일자별 건수 계산
    const dailyCompletedCountRows = await queryBuilder
      .clone()
      .select('DATE(t.completed_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .andWhere('t.status = :status', { status: TaskStatus.Done })
      .andWhere('t.completed_at IS NOT NULL')
      .groupBy('DATE(t.completed_at)')
      .orderBy('DATE(t.completed_at)', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const dailyCompletedCounts: DailyCompletedCounts[] =
      dailyCompletedCountRows.map(({ date, count }) => ({
        date: dayjs(date).format('YYYY-MM-DD'),
        count: Number(count),
      }));

    return {
      ...existingProject,
      members:
        existingProject.members?.map((v) => ({
          userId: v.userId,
          role: v.role,
          name: v.user?.name,
          email: v.user.email,
        })) ?? [],
      taskSummary: {
        totalCount,
        todoCount,
        inProgressCount,
        doneCount,
        progressRate:
          totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0,
        dailyCompletedCounts,
      },
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
