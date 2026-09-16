import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.dto';
import type { Request, Response } from 'express';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

describe('AuthController', () => {
  let controller: AuthController;
  let serviceMock: {
    login: jest.Mock;
    refreshTokens: jest.Mock;
    getLoginInfo: jest.Mock;
  };

  beforeEach(async () => {
    serviceMock = {
      login: jest.fn(),
      refreshTokens: jest.fn(),
      getLoginInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('로그인 결과의 refresh token을 쿠키에 저장하고 access token을 반환한다.', async () => {
      const loginDto: LoginRequestDto = {
        id: 'test',
        password: 'test',
      };

      serviceMock.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = { cookie: jest.fn() };

      const result = await controller.login(
        loginDto,
        response as unknown as Response,
      );

      expect(serviceMock.login).toHaveBeenCalledTimes(1);
      expect(serviceMock.login).toHaveBeenCalledWith(loginDto);
      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/api/auth/refresh',
        },
      );
      expect(result).toEqual({ accessToken: 'access-token' });
    });
  });

  describe('refresh', () => {
    it('쿠키의 refresh token으로 access token을 재발급한다.', () => {
      const request = {
        cookies: { refreshToken: 'refresh-token' },
      } as unknown as Request;

      serviceMock.refreshTokens.mockReturnValue('new-access-token');

      const result = controller.refresh(request);

      expect(serviceMock.refreshTokens).toHaveBeenCalledTimes(1);
      expect(serviceMock.refreshTokens).toHaveBeenCalledWith('refresh-token');
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('refresh token 쿠키가 없으면 UnauthorizedException을 던진다.', () => {
      const request = { cookies: {} } as unknown as Request;

      expect(() => controller.refresh(request)).toThrow(UnauthorizedException);
      expect(serviceMock.refreshTokens).not.toHaveBeenCalled();
    });
  });

  describe('getLoginInfo', () => {
    it('인증된 사용자 id로 로그인 사용자 정보를 조회한다.', async () => {
      const request = {
        user: { id: 'test' },
      } as Request & { user: { id: string } };
      const loginInfo = { id: 'test' };

      serviceMock.getLoginInfo.mockResolvedValue(loginInfo);

      const result = await controller.getLoginInfo(request);

      expect(serviceMock.getLoginInfo).toHaveBeenCalledTimes(1);
      expect(serviceMock.getLoginInfo).toHaveBeenCalledWith('test');
      expect(result).toBe(loginInfo);
    });
  });
});
