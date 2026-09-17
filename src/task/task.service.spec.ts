import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { Project } from '../project/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskSearchQueryDto } from './dto/task.dto';
import { TaskPriority, TaskStatus } from '../common/enums';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: { createQueryBuilder: jest.Mock; delete: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    taskRepository = {
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
    };
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('기본 상태와 우선순위로 작업을 저장하고 작업 id를 반환한다.', async () => {
      const createTaskDto = {
        projectId: 'project-id',
        name: '테스트 작업',
        backgroundColor: '#FFFFFF',
      } as CreateTaskDto;
      const requestUserId = 'test';

      const foundProject = {
        id: createTaskDto.projectId,
        createdById: requestUserId,
      } as Project;
      const createdTask = {
        id: 'task-id',
        name: createTaskDto.name,
        backgroundColor: createTaskDto.backgroundColor,
        project: foundProject,
        status: TaskStatus.Todo,
        priority: TaskPriority.Low,
        assignee: null,
        createdBy: { id: requestUserId },
      } as Task;

      const projectRepository = {
        findOne: jest.fn().mockResolvedValue(foundProject),
      };
      const transactionTaskRepository = {
        create: jest.fn().mockReturnValue(createdTask),
        save: jest.fn(),
      };
      const manager = {
        getRepository: jest.fn((entity: unknown) =>
          entity === Project ? projectRepository : transactionTaskRepository,
        ),
      };
      dataSource.transaction.mockImplementation(
        async (callback: (managerArg: typeof manager) => Promise<string>) =>
          callback(manager),
      );

      const result = await service.create(createTaskDto, requestUserId);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTaskDto.projectId },
      });
      expect(transactionTaskRepository.create).toHaveBeenCalledWith({
        name: createTaskDto.name,
        backgroundColor: createTaskDto.backgroundColor,
        project: foundProject,
        status: TaskStatus.Todo,
        priority: TaskPriority.Low,
        assignee: null,
        createdBy: { id: requestUserId },
      });
      expect(transactionTaskRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result).toBe(createdTask.id);
    });

    it('프로젝트가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      const createTaskDto = {
        projectId: 'missing-project',
        name: '테스트 작업',
        backgroundColor: '#FFFFFF',
      } as CreateTaskDto;
      const projectRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const manager = {
        getRepository: jest.fn().mockReturnValue(projectRepository),
      };
      dataSource.transaction.mockImplementation(
        async (callback: (managerArg: typeof manager) => Promise<string>) =>
          callback(manager),
      );

      await expect(service.create(createTaskDto, 'test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('검색 조건을 QueryBuilder에 적용하고 작업 목록을 반환한다.', async () => {
    const query = {
      isMyTask: true,
      projectId: 'project-id',
      month: '2026-12',
    } as TaskSearchQueryDto;
    const requestUserId = 'test';
    const foundTasks = [{ id: 'task-id' }] as Task[];
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(foundTasks),
    };
    taskRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.getTasks(query, requestUserId);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      't.assignee_id = :assigneeId',
      { assigneeId: requestUserId },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      't.project = :projectId',
      { projectId: query.projectId },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      't.due_date >= :startDate',
      { startDate: '2026-12-01' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      't.due_date < :endDate',
      { endDate: '2027-01-01' },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('t.dueDate', 'ASC');
    expect(result).toBe(foundTasks);
  });

  describe('update', () => {
    it('작업 상태를 완료로 변경하면 완료일시를 기록하여 저장한다.', async () => {
      const requestTaskId = 'task-id';
      const updateTaskDto = { status: TaskStatus.Done } as UpdateTaskDto;
      const foundTask = {
        id: requestTaskId,
        status: TaskStatus.InProgress,
        project: { id: 'project-id', createdById: 'test' },
      } as Task;
      const transactionTaskRepository = {
        findOne: jest.fn().mockResolvedValue(foundTask),
        merge: jest.fn(),
        save: jest.fn(),
      };
      const manager = {
        getRepository: jest.fn().mockReturnValue(transactionTaskRepository),
      };
      dataSource.transaction.mockImplementation(
        async (callback: (managerArg: typeof manager) => Promise<void>) =>
          callback(manager),
      );

      await service.update(requestTaskId, updateTaskDto);

      expect(transactionTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: requestTaskId },
        relations: { project: true },
      });
      expect(transactionTaskRepository.merge).toHaveBeenCalledTimes(1);

      // mock.calls : 해당 Mock 함수가 호출될 때 전달받은 인자들을 배열로 기록한다.
      // (위의 service.update 함수 내부에서 transactionTaskRepository.merge 가 호출될 때)
      const mergeCall = transactionTaskRepository.merge.mock.calls[0] as [
        Task,
        { status: TaskStatus; completedAt: unknown },
      ];
      // mock.calls 값 검증
      expect(mergeCall[0]).toBe(foundTask); // 조회된 task 객체인지
      expect(mergeCall[1].status).toBe(TaskStatus.Done); // 상태가 완료로 변경되었는지
      expect(mergeCall[1].completedAt).toBeInstanceOf(Date); // 완료 시각이 현재 시간으로 생성되었는지
      expect(transactionTaskRepository.save).toHaveBeenCalledWith(foundTask);
    });

    it('작업이 존재하지 않으면 NotFoundException을 던진다.', async () => {
      const transactionTaskRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const manager = {
        getRepository: jest.fn().mockReturnValue(transactionTaskRepository),
      };
      dataSource.transaction.mockImplementation(
        async (callback: (managerArg: typeof manager) => Promise<void>) =>
          callback(manager),
      );

      await expect(service.update('missing-task', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('작업을 삭제한다.', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('task-id');

      expect(taskRepository.delete).toHaveBeenCalledWith('task-id');
    });

    it('삭제된 작업이 없으면 NotFoundException을 던진다.', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('missing-task')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
