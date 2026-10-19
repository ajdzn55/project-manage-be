import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskSearchQueryDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let serviceMock: Record<
    'create' | 'getTasks' | 'update' | 'remove',
    jest.Mock
  >;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      getTasks: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: serviceMock }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('작업 정보와 인증된 사용자 id를 전달하고 작업 id를 반환한다.', async () => {
    const createTaskDto = {
      projectId: 'project-id',
      name: '테스트 작업',
      backgroundColor: '#FFFFFF',
    } as CreateTaskDto;
    const authenticatedUser = { id: 'test' };
    const createdTaskId = 'task-id';
    serviceMock.create.mockResolvedValue(createdTaskId);

    const result = await controller.create(createTaskDto, authenticatedUser);

    expect(serviceMock.create).toHaveBeenCalledWith(
      createTaskDto,
      authenticatedUser.id,
    );
    expect(result).toBe(createdTaskId);
  });

  it('검색 조건과 인증된 사용자 id를 전달하고 작업 목록을 반환한다.', async () => {
    const query = { projectId: 'project-id' } as TaskSearchQueryDto;
    const authenticatedUser = { id: 'test' };
    const foundTasks = [{ id: 'task-id', name: '테스트 작업' }];
    serviceMock.getTasks.mockResolvedValue(foundTasks);

    const result = await controller.getTasks(query, authenticatedUser);

    expect(serviceMock.getTasks).toHaveBeenCalledWith(
      query,
      authenticatedUser.id,
    );
    expect(result).toBe(foundTasks);
  });

  it('검색 조건이 없으면 BadRequestException을 던진다.', () => {
    const query = {} as TaskSearchQueryDto;
    const authenticatedUser = { id: 'test' };

    expect(() => controller.getTasks(query, authenticatedUser)).toThrow(
      BadRequestException,
    );
    expect(serviceMock.getTasks).not.toHaveBeenCalled();
  });

  it('작업 id와 수정 정보를 전달한다.', async () => {
    const requestTaskId = 'task-id';
    const updateTaskDto = { name: '수정 작업' } as UpdateTaskDto;

    await controller.update(requestTaskId, updateTaskDto);

    expect(serviceMock.update).toHaveBeenCalledWith(
      requestTaskId,
      updateTaskDto,
    );
  });

  it('작업 id를 전달하여 삭제한다.', async () => {
    const requestTaskId = 'task-id';

    await controller.remove(requestTaskId);

    expect(serviceMock.remove).toHaveBeenCalledWith(requestTaskId);
  });
});
