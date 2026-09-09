import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInfoDto, LoginRequestDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    return await this.jwtService.signAsync({ sub: user.id });
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
