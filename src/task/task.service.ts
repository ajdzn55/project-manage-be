import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { TaskPriority, TaskStatus } from '../common/enums';
import { TaskSearchQueryDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const targetProject = await this.projectRepository.findOne({
      where: { id: createTaskDto.projectId },
    });

    if (!targetProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectId, createdById, assigneeId, status, priority, ...res } =
      createTaskDto;
    const task = this.repository.create({
      ...res,
      project: targetProject,
      status: status ?? TaskStatus.Todo,
      priority: priority ?? TaskPriority.Low,
      assignee: assigneeId ? { id: assigneeId } : null,
      createdBy: { id: createdById } as User, // TODO: DTO에서 createdById 없애고 로그인 사용자 아이디로 대체하기
    });

    await this.repository.save(task);

    return task.id;
  }

  getTasks(params: TaskSearchQueryDto) {
    const qb = this.repository.createQueryBuilder('t');

    if (params.projectId) {
      qb.where('t.project = :projectId', { projectId: params.projectId });
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
    const { assigneeId, ...res } = updateTaskDto;

    const task = await this.repository.preload({
      id,
      ...res,
      ...(assigneeId !== undefined
        ? {
            assignee: assigneeId === null ? null : { id: assigneeId },
          }
        : {}),
    });

    if (!task) {
      throw new NotFoundException('존재하지 않는 작업입니다.');
    }

    await this.repository.save(task);
  }

  async remove(id: string) {
    const deleteResult = await this.repository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException('존재하지 않는 작업입니다.');
    }
  }
}
