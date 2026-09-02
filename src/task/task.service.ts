import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { TaskPriority, TaskStatus } from '../common/enums';

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

  async findAll(projectId: string) {
    const targetProject = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!targetProject) {
      throw new NotFoundException('존재하지 않는 프로젝트 입니다.');
    }

    return await this.repository.findBy({ project: { id: targetProject.id } });
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
