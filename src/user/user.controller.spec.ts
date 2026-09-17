import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSearchQueryDto } from './dto/user.dto';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let serviceMock: Record<
    | 'signUp'
    | 'findAll'
    | 'getNoticeCheck'
    | 'findOne'
    | 'update'
    | 'remove'
    | 'restore'
    | 'checkNotice',
    jest.Mock
  >;

  beforeEach(async () => {
    serviceMock = {
      signUp: jest.fn(),
      findAll: jest.fn(),
      getNoticeCheck: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      checkNotice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('회원가입 정보를 전달하고 생성된 사용자 id를 반환한다.', async () => {
    const signUpDto = {
      id: 'test',
      name: '테스트',
      email: 'test@example.com',
      password: 'password',
    } as SignUpDto;
    const createdUserId = signUpDto.id;
    serviceMock.signUp.mockResolvedValue(createdUserId);

    const result = await controller.create(signUpDto);

    expect(serviceMock.signUp).toHaveBeenCalledWith(signUpDto);
    expect(result).toBe(createdUserId);
  });

  it('검색 조건을 전달하고 사용자 목록을 반환한다.', async () => {
    const query = { withDeleted: false } as UserSearchQueryDto;
    const foundUsers = [{ id: 'test', name: '테스트' }];
    serviceMock.findAll.mockResolvedValue(foundUsers);

    const result = await controller.findAll(query);

    expect(serviceMock.findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(foundUsers);
  });

  it('인증된 사용자 id로 마지막 알림 확인일을 조회한다.', async () => {
    const authenticatedUser = { id: 'test' };
    const foundNoticeCheck = { lastCheckedDate: '2026-09-16' };
    serviceMock.getNoticeCheck.mockResolvedValue(foundNoticeCheck);

    const result = await controller.getNoticeCheck(authenticatedUser);

    expect(serviceMock.getNoticeCheck).toHaveBeenCalledWith(
      authenticatedUser.id,
    );
    expect(result).toBe(foundNoticeCheck);
  });

  it('사용자 id를 전달하고 조회한 사용자를 반환한다.', async () => {
    const requestUserId = 'test';
    const foundUser = { id: requestUserId, name: '테스트' };
    serviceMock.findOne.mockResolvedValue(foundUser);

    const result = await controller.findOne(requestUserId);

    expect(serviceMock.findOne).toHaveBeenCalledWith(requestUserId);
    expect(result).toBe(foundUser);
  });

  it('사용자 id와 수정 정보를 전달한다.', async () => {
    const requestUserId = 'test';
    const updateUserDto = { name: '수정된 이름' } as UpdateUserDto;

    await controller.update(requestUserId, updateUserDto);

    expect(serviceMock.update).toHaveBeenCalledWith(
      requestUserId,
      updateUserDto,
    );
  });

  it('사용자 id를 전달하여 삭제한다.', async () => {
    const requestUserId = 'test';

    await controller.delete(requestUserId);

    expect(serviceMock.remove).toHaveBeenCalledWith(requestUserId);
  });

  it('사용자 id를 전달하여 삭제를 취소한다.', async () => {
    const requestUserId = 'test';

    await controller.restore(requestUserId);

    expect(serviceMock.restore).toHaveBeenCalledWith(requestUserId);
  });

  it('인증된 사용자 id를 전달하여 알림 확인일을 기록한다.', async () => {
    const authenticatedUser = { id: 'test' };

    await controller.checkNotice(authenticatedUser);

    expect(serviceMock.checkNotice).toHaveBeenCalledWith(authenticatedUser.id);
  });
});
