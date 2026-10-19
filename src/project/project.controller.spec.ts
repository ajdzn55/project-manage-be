import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectSearchQueryDto } from './dto/project.dto';
import { BadRequestException } from '@nestjs/common';

describe('ProjectController', () => {
  let controller: ProjectController;
  let serviceMock: Record<
    'create' | 'getProjects' | 'findOne' | 'update' | 'remove',
    jest.Mock
  >;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      getProjects: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: ProjectService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('프로젝트 정보와 인증된 사용자 id를 전달하고 프로젝트 id를 반환한다.', async () => {
    const createProjectDto = { name: '테스트 프로젝트' } as CreateProjectDto;
    const authenticatedUser = { id: 'test' };
    const createdProjectId = 'project-id';
    serviceMock.create.mockResolvedValue(createdProjectId);

    const result = await controller.create(createProjectDto, authenticatedUser);

    expect(serviceMock.create).toHaveBeenCalledWith(
      createProjectDto,
      authenticatedUser.id,
    );
    expect(result).toBe(createdProjectId);
  });

  it('프로젝트 목록을 반환한다.', async () => {
    const query = {
      name: '테스트',
      page: 1,
      limit: 100,
    } as ProjectSearchQueryDto;
    const authenticatedUser = { id: 'test' };
    const foundProjects = {
      totalCount: 1,
      data: [{ id: 'project-id', name: '테스트 프로젝트' }],
    };
    serviceMock.getProjects.mockResolvedValue(foundProjects);

    const result = await controller.findAll(query, authenticatedUser);

    expect(serviceMock.getProjects).toHaveBeenCalledWith(
      query,
      authenticatedUser.id,
    );
    expect(result).toBe(foundProjects);
  });

  it('프로젝트 id를 전달하고 조회 결과를 반환한다.', async () => {
    const requestProjectId = 'project-id';
    const foundProject = { id: requestProjectId, name: '테스트 프로젝트' };
    serviceMock.findOne.mockResolvedValue(foundProject);

    const result = await controller.findOne(requestProjectId);

    expect(serviceMock.findOne).toHaveBeenCalledWith(requestProjectId);
    expect(result).toBe(foundProject);
  });

  it('검색 조건이 없으면 BadRequestException을 던진다.', () => {
    const query = { page: 1, limit: 100 } as ProjectSearchQueryDto;
    const authenticatedUser = { id: 'test' };

    expect(() => controller.findAll(query, authenticatedUser)).toThrow(
      BadRequestException,
    );
    expect(serviceMock.getProjects).not.toHaveBeenCalled();
  });

  it('프로젝트 id와 수정 정보를 전달한다.', async () => {
    const requestProjectId = 'project-id';
    const updateProjectDto = { name: '수정 프로젝트' } as UpdateProjectDto;

    await controller.update(requestProjectId, updateProjectDto);

    expect(serviceMock.update).toHaveBeenCalledWith(
      requestProjectId,
      updateProjectDto,
    );
  });

  it('프로젝트 id를 전달하여 삭제한다.', async () => {
    const requestProjectId = 'project-id';

    await controller.remove(requestProjectId);

    expect(serviceMock.remove).toHaveBeenCalledWith(requestProjectId);
  });
});
