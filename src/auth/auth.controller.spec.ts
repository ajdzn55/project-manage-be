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

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      serviceMock.login.mockResolvedValue({ accessToken, refreshToken });

      const response = { cookie: jest.fn() };

      const result = await controller.login(
        loginDto,
        response as unknown as Response,
      );

      expect(serviceMock.login).toHaveBeenCalledTimes(1);
      expect(serviceMock.login).toHaveBeenCalledWith(loginDto);
      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        refreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/api/auth/refresh',
        },
      );
      expect(result).toEqual({ accessToken });
    });
  });

  describe('refresh', () => {
    it('쿠키의 refresh token으로 access token을 재발급한다.', () => {
      const refreshToken = 'refresh-token';
      const newAccessToken = 'new-access-token';

      const request = {
        cookies: { refreshToken },
      } as unknown as Request;

      serviceMock.refreshTokens.mockReturnValue(newAccessToken);

      const result = controller.refresh(request);

      expect(serviceMock.refreshTokens).toHaveBeenCalledTimes(1);
      expect(serviceMock.refreshTokens).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual({ accessToken: newAccessToken });
    });

    it('refresh token 쿠키가 없으면 UnauthorizedException을 던진다.', () => {
      const request = { cookies: {} } as unknown as Request;

      expect(() => controller.refresh(request)).toThrow(UnauthorizedException);
      expect(serviceMock.refreshTokens).not.toHaveBeenCalled();
    });
  });

  describe('getLoginInfo', () => {
    it('인증된 사용자 id로 로그인 사용자 정보를 조회한다.', async () => {
      const requestUserId = 'test';

      const request = {
        user: { id: requestUserId },
      } as Request & { user: { id: string } };
      const foundLoginInfo = { id: requestUserId };

      serviceMock.getLoginInfo.mockResolvedValue(foundLoginInfo);

      const result = await controller.getLoginInfo(request);

      expect(serviceMock.getLoginInfo).toHaveBeenCalledTimes(1);
      expect(serviceMock.getLoginInfo).toHaveBeenCalledWith(requestUserId);
      expect(result).toBe(foundLoginInfo);
    });
  });
});
