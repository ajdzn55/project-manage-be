import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../auth/jwt.strategy';

export type UserFromJwt = { id: JwtPayload['sub'] };

interface RequestWithUser extends Request {
  user: UserFromJwt;
}

export const GetUser = createParamDecorator(
  (data: keyof UserFromJwt | undefined, ctx: ExecutionContext) => {
    // ctx: 현재 요청에 대한 정보를 담고 있는 실행 컨텍스트 객체
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    // JwtStrategy의 validate()가 반환한 유저 객체
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
