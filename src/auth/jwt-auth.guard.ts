import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // context 에는 현재 요청, 실행할 컨트롤러, 메서드 정보가 들어있음.
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 현재 실행할 메서드
      context.getClass(), // 해당 컨트롤러
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
