import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // 토큰 위치
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 만료된 토큰 거부 여부
      ignoreExpiration: false,
      // 서명을 확인할 비밀 KEY
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // 위의 검사를 통과한 토큰으로 요청 사용자 정보 구성
  validate(payload: JwtPayload) {
    return { id: payload.sub };
  }
}
