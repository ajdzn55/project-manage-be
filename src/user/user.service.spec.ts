import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserNoticeCheck } from './entities/user-check-notice.entity';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchQueryDto } from './dto/user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Record<
    | 'findOneBy'
    | 'find'
    | 'create'
    | 'save'
    | 'merge'
    | 'softDelete'
    | 'findOne'
    | 'restore',
    jest.Mock
  >;
  let noticeRepository: Record<'findOne' | 'create' | 'save', jest.Mock>;

  beforeEach(async () => {
    userRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      softDelete: jest.fn(),
      findOne: jest.fn(),
      restore: jest.fn(),
    };
    noticeRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(UserNoticeCheck),
          useValue: noticeRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('비밀번호를 해시하여 사용자를 저장하고 사용자 id를 반환한다.', async () => {
      const signUpDto = {
        id: 'test',
        name: '테스트',
        password: 'plain-password',
      } as SignUpDto;
      const hashedPassword = 'hashed-password';
      const createdUser = { ...signUpDto, password: hashedPassword } as User;
      userRepository.findOneBy.mockResolvedValue(null);
      userRepository.create.mockReturnValue(createdUser);
      const hashPasswordSpy = jest
        .spyOn(service, 'hashPassword')
        .mockResolvedValue(hashedPassword);

      const result = await service.signUp(signUpDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: signUpDto.id,
      });
      expect(hashPasswordSpy).toHaveBeenCalledWith(signUpDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...signUpDto,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(signUpDto.id);
    });

    it('동일한 id의 사용자가 존재하면 ConflictException을 던진다.', async () => {
      const signUpDto = {
        id: 'existing-user',
        name: '기존 사용자',
        password: 'password',
      } as SignUpDto;
      userRepository.findOneBy.mockResolvedValue({ id: signUpDto.id });
      const hashPasswordSpy = jest.spyOn(service, 'hashPassword');

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      expect(hashPasswordSpy).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  it('검색 조건으로 사용자 목록을 조회한다.', async () => {
    const query = { withDeleted: true } as UserSearchQueryDto;
    const foundUsers = [{ id: 'test' }] as User[];
    userRepository.find.mockResolvedValue(foundUsers);

    const result = await service.findAll(query);

    expect(userRepository.find).toHaveBeenCalledWith({
      withDeleted: query.withDeleted,
      order: { id: 'ASC' },
    });
    expect(result).toBe(foundUsers);
  });

  describe('findOne', () => {
    it('사용자가 존재하면 조회 결과를 반환한다.', async () => {
      const requestUserId = 'test';
      const foundUser = { id: requestUserId } as User;
      userRepository.findOneBy.mockResolvedValue(foundUser);

      const result = await service.findOne(requestUserId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: requestUserId,
      });
      expect(result).toBe(foundUser);
    });

    it('사용자가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('missing-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('사용자 정보를 병합하여 저장한다.', async () => {
    const requestUserId = 'test';
    const updateUserDto = { name: '수정된 이름' } as UpdateUserDto;
    const foundUser = { id: requestUserId, name: '기존 이름' } as User;
    const mergedUser = { ...foundUser, ...updateUserDto };
    userRepository.findOneBy.mockResolvedValue(foundUser);
    userRepository.merge.mockReturnValue(mergedUser);

    await service.update(requestUserId, updateUserDto);

    expect(userRepository.merge).toHaveBeenCalledWith(foundUser, updateUserDto);
    expect(userRepository.save).toHaveBeenCalledWith(mergedUser);
  });

  describe('remove', () => {
    it('사용자를 soft delete한다.', async () => {
      userRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('test');

      expect(userRepository.softDelete).toHaveBeenCalledWith('test');
    });

    it('삭제된 사용자가 없으면 NotFoundException을 던진다.', async () => {
      userRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('missing-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('삭제된 사용자가 존재하면 복구한다.', async () => {
    const requestUserId = 'test';
    userRepository.findOne.mockResolvedValue({ id: requestUserId });

    await service.restore(requestUserId);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: requestUserId },
      withDeleted: true,
    });
    expect(userRepository.restore).toHaveBeenCalledWith(requestUserId);
  });

  it('알림 확인일을 생성하여 저장한다.', async () => {
    const requestUserId = 'test';
    const foundUser = { id: requestUserId };
    const createdNoticeCheck = {
      userId: requestUserId,
      lastCheckedDate: '2026-09-16',
    };

    // noticeRepository.create 가 실행되어야 noticeInput에 값이 기록되기 때문에 undefined 일수도 있다고 가정
    let noticeInput: { userId: string; lastCheckedDate: string } | undefined;

    userRepository.findOne.mockResolvedValue(foundUser);
    noticeRepository.create.mockImplementation(
      (input: { userId: string; lastCheckedDate: string }) => {
        noticeInput = input;
        return createdNoticeCheck;
      },
    );

    await service.checkNotice(requestUserId);

    expect(noticeRepository.create).toHaveBeenCalledTimes(1);
    expect(noticeInput).toBeDefined();
    if (!noticeInput) {
      throw new Error('알림 확인일 생성 인자가 기록되지 않았습니다.');
    }
    expect(noticeInput.userId).toBe(requestUserId);
    expect(noticeInput.lastCheckedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(noticeRepository.save).toHaveBeenCalledWith(createdNoticeCheck);
  });

  it('저장된 마지막 알림 확인일이 없으면 null을 반환한다.', async () => {
    noticeRepository.findOne.mockResolvedValue(null);

    const result = await service.getNoticeCheck('test');

    expect(result).toEqual({ lastCheckedDate: null });
  });
});
