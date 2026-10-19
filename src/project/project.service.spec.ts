import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MemberRole, ProjectStatus, TaskStatus } from '../common/enums';
import { ProjectSearchQueryDto } from './dto/project.dto';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: Record<
    'findAndCount' | 'findOne' | 'update' | 'delete',
    jest.Mock
  > & { createQueryBuilder: jest.Mock };
  let taskRepository: { createQueryBuilder: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    projectRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    taskRepository = { createQueryBuilder: jest.fn() };
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('프로젝트와 소유자를 저장하고 생성된 프로젝트 id를 반환한다.', async () => {
      const createProjectDto = { name: '테스트 프로젝트' } as CreateProjectDto;
      const requestUserId = 'test';
      const createdProject = {
        name: createProjectDto.name,
        status: ProjectStatus.Planned,
        createdBy: { id: requestUserId },
      };
      const savedProject = { ...createdProject, id: 'project-id' } as Project;
      const createdOwner = {
        projectId: savedProject.id,
        userId: requestUserId,
        role: MemberRole.Owner,
      };
      const transactionProjectRepository = {
        create: jest.fn().mockReturnValue(createdProject),
        save: jest.fn().mockResolvedValue(savedProject),
      };
      const memberRepository = {
        create: jest.fn().mockReturnValue(createdOwner),
        save: jest.fn(),
      };

      // dataSource.transaction 내부에서 사용할 EntityManager Mock
      const manager = {
        getRepository: jest.fn((entity: unknown) =>
          entity === Project ? transactionProjectRepository : memberRepository,
        ),
      };

      // dataSource.transaction Mock
      dataSource.transaction.mockImplementation(
        async (callback: (managerArg: unknown) => Promise<string>) =>
          callback(manager),
      );

      const result = await service.create(createProjectDto, requestUserId);

      expect(transactionProjectRepository.create).toHaveBeenCalledWith({
        name: createProjectDto.name,
        status: ProjectStatus.Planned,
        createdBy: { id: requestUserId },
      });
      expect(memberRepository.create).toHaveBeenCalledWith({
        projectId: savedProject.id,
        userId: requestUserId,
        role: MemberRole.Owner,
      });
      expect(memberRepository.save).toHaveBeenCalledWith(createdOwner);
      expect(result).toBe(savedProject.id);
    });
  });

  describe('search', () => {
    it('검색 조건을 QueryBuilder에 적용하고 프로젝트 목록을 반환한다.', async () => {
      const query = {
        name: '프로젝트',
        status: ProjectStatus.Planned,
        isMyProject: true,
      } as ProjectSearchQueryDto;
      const requestUserId = 'test';
      const foundProjects = [{ id: 'project-id' }] as Project[];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([foundProjects, 1]),
      };
      projectRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getProjects(query, requestUserId);

      expect(queryBuilder.where).toHaveBeenCalledWith('p.name ILIKE :name', {
        name: `%${query.name}%`,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('p.status = :status', {
        status: query.status,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'p.createdBy = :userId',
        { userId: requestUserId },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('p.createdAt', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('p.id', 'ASC');

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(100);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalledWith();

      expect(result).toEqual({
        totalCount: 1,
        data: foundProjects,
      });
    });

    it('페이지와 조회 수를 기준으로 offset을 계산하여 프로젝트 목록을 반환한다.', async () => {
      const query = {
        name: '프로젝트',
        page: 2,
        limit: 10,
      } as ProjectSearchQueryDto;
      const requestUserId = 'test';
      const foundProjects = [{ id: 'project-id' }] as Project[];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([foundProjects, 11]),
      };
      projectRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getProjects(query, requestUserId);

      expect(queryBuilder.where).toHaveBeenCalledWith('p.name ILIKE :name', {
        name: `%${query.name}%`,
      });
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('p.createdAt', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('p.id', 'ASC');

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalledWith();

      expect(result).toEqual({
        totalCount: 11,
        data: foundProjects,
      });
    });
  });

  describe('findOne', () => {
    it('프로젝트와 작업 통계를 조합하여 반환한다.', async () => {
      const requestProjectId = 'project-id';
      const foundProject = {
        id: requestProjectId,
        name: '테스트 프로젝트',
        members: [
          {
            userId: 'test',
            role: MemberRole.Owner,
            user: { name: '테스트', email: 'test@example.com' },
          },
        ],
      } as Project;
      const foundTasks = [
        { status: TaskStatus.Todo },
        { status: TaskStatus.InProgress },
        { status: TaskStatus.Done },
        { status: TaskStatus.Done },
      ] as Task[];
      const summaryQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ date: '2026-09-16', count: '2' }]),
      };
      const taskQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(foundTasks),
        clone: jest.fn().mockReturnValue(summaryQueryBuilder),
      };
      projectRepository.findOne.mockResolvedValue(foundProject);
      taskRepository.createQueryBuilder.mockReturnValue(taskQueryBuilder);

      const result = await service.findOne(requestProjectId);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: requestProjectId },
        withDeleted: true,
        relations: { createdBy: true, members: { user: true } },
      });
      expect(taskQueryBuilder.where).toHaveBeenCalledWith(
        't.project_id = :projectId',
        { projectId: requestProjectId },
      );
      expect(result.taskSummary).toEqual({
        totalCount: 4,
        todoCount: 1,
        inProgressCount: 1,
        doneCount: 2,
        progressRate: 50,
        dailyCompletedCounts: [{ date: '2026-09-16', count: 2 }],
      });
      expect(result.members).toEqual([
        {
          userId: 'test',
          role: MemberRole.Owner,
          name: '테스트',
          email: 'test@example.com',
        },
      ]);
    });

    it('프로젝트가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-project')).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('프로젝트 정보를 수정한다.', async () => {
      const requestProjectId = 'project-id';
      const updateProjectDto = { name: '수정 프로젝트' } as UpdateProjectDto;
      projectRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(requestProjectId, updateProjectDto);

      expect(projectRepository.update).toHaveBeenCalledWith(
        requestProjectId,
        updateProjectDto,
      );
    });

    it('수정된 프로젝트가 없으면 NotFoundException을 던진다.', async () => {
      projectRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update('missing-project', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('프로젝트를 삭제한다.', async () => {
      projectRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('project-id');

      expect(projectRepository.delete).toHaveBeenCalledWith('project-id');
    });

    it('삭제된 프로젝트가 없으면 NotFoundException을 던진다.', async () => {
      projectRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('missing-project')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
