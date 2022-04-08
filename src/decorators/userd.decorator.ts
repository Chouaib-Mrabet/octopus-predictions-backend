import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorateur récupérable via @User
export const Userd = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
