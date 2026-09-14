import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInfoDto, LoginRequestDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login({ id, password }: LoginRequestDto) {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('id = :id', { id })
      .getOne();

    // 사용자 존재 여부 및 비밀번호 일치 여부 확인
    if (!user || !(await this.verifyPassword(password, user.password))) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 토큰 발급
    const accessToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '1d',
      },
    );

    return { accessToken, refreshToken };
  }

  refreshTokens(refreshToken: string) {
    try {
      // Refresh Token 검증(서명/만료 확인) 및 복호화
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new UnauthorizedException();
      }

      // Access Token 발급
      return this.jwtService.sign(
        { sub: payload?.sub },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      );
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async getLoginInfo(userId: string): Promise<LoginInfoDto> {
    const user = await this.userService.findOne(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // 생성된 해시 값과 DB에 저장된 값 비교
    return await bcrypt.compare(password, hash);
  }
}
