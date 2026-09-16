import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { LoginRequestDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let userService: { findOne: jest.Mock };
  let queryBuilder: {
    addSelect: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock;
  };
  let userRepository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    jwtService = { sign: jest.fn(), verify: jest.fn() };
    configService = { getOrThrow: jest.fn() };
    userService = { findOne: jest.fn() };
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    userRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('사용자와 비밀번호가 일치하면 access token과 refresh token을 발급하여 반환한다.', async () => {
      const loginDto: LoginRequestDto = {
        id: 'test',
        password: 'plain-password',
      };

      const user = {
        id: 'test',
        password: 'hashed-password',
      } as User;

      const payload = { sub: 'test' };

      queryBuilder.getOne.mockResolvedValue(user);

      const verifyPasswordSpy = jest
        .spyOn(service, 'verifyPassword')
        .mockResolvedValue(true);

      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') {
          return 'access-secret';
        }
        return 'refresh-secret';
      });

      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('u');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('u.password');
      expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', {
        id: 'test',
      });
      expect(queryBuilder.getOne).toHaveBeenCalledTimes(1);

      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );

      expect(jwtService.sign).toHaveBeenNthCalledWith(1, payload, {
        secret: 'access-secret',
        expiresIn: '1h',
      });
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, payload, {
        secret: 'refresh-secret',
        expiresIn: '1d',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('사용자가 존재하지 않는 경우 UnauthorizedException을 던진다.', async () => {
      const loginDto: LoginRequestDto = {
        id: 'missing-user',
        password: 'password',
      };

      const verifyPasswordSpy = jest.spyOn(service, 'verifyPassword');

      queryBuilder.getOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(verifyPasswordSpy).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('비밀번호가 일치하지 않는 경우 UnauthorizedException을 던진다.', async () => {
      const loginDto: LoginRequestDto = {
        id: 'test',
        password: 'wrong-password',
      };

      const user = {
        id: 'test',
        password: 'hashed-password',
      } as User;

      queryBuilder.getOne.mockResolvedValue(user);

      const verifyPasswordSpy = jest
        .spyOn(service, 'verifyPassword')
        .mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('유효한 refresh token이면 새로운 access token을 발급하여 반환한다.', () => {
      const payload = { sub: 'test' };

      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') {
          return 'refresh-secret';
        }
        return 'access-secret';
      });
      jwtService.verify.mockReturnValue(payload);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = service.refreshTokens('refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('refresh-token', {
        secret: 'refresh-secret',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        secret: 'access-secret',
        expiresIn: '15m',
      });
      expect(result).toBe('new-access-token');
    });

    it('refresh token 검증에 실패하면 UnauthorizedException을 던진다.', () => {
      configService.getOrThrow.mockReturnValue('refresh-secret');
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => service.refreshTokens('invalid-refresh-token')).toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('refresh token payload에 사용자 id가 없으면 UnauthorizedException을 던진다.', () => {
      configService.getOrThrow.mockReturnValue('refresh-secret');
      jwtService.verify.mockReturnValue({ sub: '' });

      expect(() => service.refreshTokens('refresh-token')).toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getLoginInfo', () => {
    it('사용자를 조회하여 로그인 사용자 정보를 반환한다.', async () => {
      const user = {
        id: 'test',
        name: '테스트',
        email: 'test@example.com',
        createdAt: new Date('2026-09-16T00:00:00.000Z'),
        password: 'hashed-password',
      } as User;

      userService.findOne.mockResolvedValue(user);

      const result = await service.getLoginInfo('test');

      expect(userService.findOne).toHaveBeenCalledWith('test');
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    });
  });

  describe('verifyPassword', () => {
    it('평문 비밀번호와 해시의 일치 여부를 반환한다.', async () => {
      const hash = await bcrypt.hash('plain-password', 4);

      await expect(
        service.verifyPassword('plain-password', hash),
      ).resolves.toBe(true);
      await expect(
        service.verifyPassword('wrong-password', hash),
      ).resolves.toBe(false);
    });
  });
});
