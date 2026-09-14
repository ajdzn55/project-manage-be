import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginInfoDto,
  LoginRequestDto,
  LoginResponseDto,
} from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

type AuthenticatedRequest = Request & {
  user: { id: string };
};

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인', security: [] })
  @ApiCreatedResponse({
    type: () => LoginResponseDto,
    description: '성공',
  })
  @ApiUnauthorizedResponse({ description: '로그인 정보가 잘못되었습니다.' })
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
    });

    return { accessToken };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() request: Request) {
    const prevRefreshToken: unknown = request.cookies?.['refreshToken'];

    if (typeof prevRefreshToken !== 'string' || !prevRefreshToken) {
      throw new UnauthorizedException();
    }

    const accessToken = this.authService.refreshTokens(prevRefreshToken);

    return { accessToken };
  }

  @ApiOperation({ summary: '로그인 정보 조회' })
  @ApiOkResponse({
    type: LoginInfoDto,
    description: '성공 시 로그인 유저 반환',
  })
  @Header('Cache-Control', 'no-store')
  @Get('login')
  @Header('Cache-Control', 'no-store')
  getLoginInfo(@Req() request: AuthenticatedRequest) {
    return this.authService.getLoginInfo(request.user.id);
  }
}
