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
import { LoginInfoDto, LoginRequestDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';

type AuthenticatedRequest = Request & {
  user: { id: string };
};

const TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인', security: [] })
  @ApiNoContentResponse({ description: '성공' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUnauthorizedResponse({ description: '로그인 정보가 잘못되었습니다.' })
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    response.cookie('accessToken', accessToken, TOKEN_COOKIE_OPTIONS);
    response.cookie('refreshToken', refreshToken, TOKEN_COOKIE_OPTIONS);
  }

  @ApiCookieAuth('refreshTokenAuth')
  @ApiOperation({ summary: 'Access Token 재발급' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const prevRefreshToken: unknown = request.cookies?.['refreshToken'];

    if (typeof prevRefreshToken !== 'string' || !prevRefreshToken) {
      throw new UnauthorizedException();
    }

    const accessToken = this.authService.refreshTokens(prevRefreshToken);
    response.cookie('accessToken', accessToken, TOKEN_COOKIE_OPTIONS);
  }

  @ApiOperation({ summary: '로그인 정보 조회' })
  @ApiOkResponse({
    type: LoginInfoDto,
    description: '성공 시 로그인 유저 반환',
  })
  @Header('Cache-Control', 'no-store')
  @Get('login')
  getLoginInfo(@Req() request: AuthenticatedRequest) {
    return this.authService.getLoginInfo(request.user.id);
  }

  @Public()
  @ApiOperation({ summary: '로그아웃' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() response: Response) {
    response.clearCookie('accessToken', TOKEN_COOKIE_OPTIONS);
    response.clearCookie('refreshToken', TOKEN_COOKIE_OPTIONS);
    response.send('ok');
  }
}
