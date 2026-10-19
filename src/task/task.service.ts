import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DataSource, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { MemberRole, TaskPriority, TaskStatus } from '../common/enums';
import { TaskSearchQueryDto } from './dto/task.dto';
import { ProjectMember } from '../project-member/entities/project-member.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const projectRepository = manager.getRepository(Project);
      const targetProject = await projectRepository.findOne({
        where: { id: createTaskDto.projectId },
      });

      if (!targetProject) {
        throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
      }

      const taskRepository = manager.getRepository(Task);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { projectId, assigneeId, status, priority, ...res } = createTaskDto;
      const task = taskRepository.create({
        ...res,
        project: targetProject,
        status: status ?? TaskStatus.Todo,
        priority: priority ?? TaskPriority.Low,
        assignee: assigneeId ? { id: assigneeId } : null,
        createdBy: { id: userId } as User,
      });

      await taskRepository.save(task);

      if (assigneeId) {
        const memberRepository = manager.getRepository(ProjectMember);
        const targetMember = await memberRepository.findOne({
          where: {
            project: { id: targetProject.id },
            user: { id: assigneeId },
          },
        });

        if (!targetMember) {
          const member = memberRepository.create({
            project: { id: targetProject.id },
            user: { id: assigneeId },
            role:
              assigneeId === targetProject.createdById
                ? MemberRole.Owner
                : MemberRole.Member,
          });

          await memberRepository.save(member);
        }
      }

      return task.id;
    });
  }

  getTasks(params: TaskSearchQueryDto, userId: string) {
    const qb = this.repository.createQueryBuilder('t');

    if (params.isMyTask) {
      qb.where('t.assignee_id = :assigneeId', { assigneeId: userId });
    }

    if (params.projectId) {
      qb.andWhere('t.project = :projectId', { projectId: params.projectId });
    }

    if (params.month) {
      const targetMonth = params.month.replace('-', '');
      const year = Number(targetMonth.substring(0, 4));
      const month = Number(targetMonth.substring(4, 6));

      const nextYear = month === 12 ? year + 1 : year;
      const nextMonth = month === 12 ? 1 : month + 1;

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      qb.andWhere('t.due_date >= :startDate', { startDate }).andWhere(
        't.due_date < :endDate',
        { endDate },
      );
    }
    qb.orderBy('t.dueDate', 'ASC');

    return qb.getMany();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.dataSource.transaction(async (manager) => {
      const taskRepository = manager.getRepository(Task);
      const { assigneeId, ...res } = updateTaskDto;

      const task = await taskRepository.findOne({
        where: { id },
        relations: { project: true },
      });

      if (!task) {
        throw new NotFoundException('존재하지 않는 작업입니다.');
      }

      if (assigneeId && task.assigneeId !== assigneeId) {
        const { id, createdById } = task.project;

        const memberRepository = manager.getRepository(ProjectMember);
        const targetMember = await memberRepository.findOne({
          where: {
            project: { id },
            user: { id: assigneeId },
          },
        });

        if (!targetMember) {
          const member = memberRepository.create({
            project: { id },
            user: { id: assigneeId },
            role:
              assigneeId === createdById ? MemberRole.Owner : MemberRole.Member,
          });

          await memberRepository.save(member);
        }
      }

      taskRepository.merge(task, {
        ...res,
        ...(assigneeId !== undefined
          ? {
              assignee: assigneeId === null ? null : { id: assigneeId },
            }
          : {}),
        ...(updateTaskDto.status === TaskStatus.Done &&
        task.status !== TaskStatus.Done
          ? { completedAt: new Date() }
          : updateTaskDto.status !== undefined &&
              updateTaskDto.status !== TaskStatus.Done
            ? { completedAt: null }
            : {}),
      });

      await taskRepository.save(task);
    });
  }

  async remove(id: string) {
    const deleteResult = await this.repository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException('존재하지 않는 작업입니다.');
    }
  }
}
