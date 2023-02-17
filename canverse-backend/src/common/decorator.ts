import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  return user;
});
