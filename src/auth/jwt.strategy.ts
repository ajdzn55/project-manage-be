import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

const accessTokenCookieExtractor = (request: Request) => {
  const accessToken: unknown = request.cookies?.['accessToken'];

  return accessToken && typeof accessToken === 'string' ? accessToken : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // 쿠키에서 토큰 꺼내도록
      jwtFromRequest: accessTokenCookieExtractor,
      // 만료된 토큰 거부 여부
      ignoreExpiration: false,
      // 서명을 확인할 비밀 KEY
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  // 위의 검사(토큰 검증)를 통과한 토큰으로 요청 사용자 정보 구성
  validate(payload: JwtPayload) {
    // payload: {
    //   sub: userId,
    //   userName: '...',
    //   iat: ...,
    //   exp: ...,
    // }
    return { id: payload.sub };
  }
}
