import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        return request.user.userId
    }
)
export const AccessTokenHeader = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        if (request.headers.authorization) {
            return request.headers.authorization.split(' ')[1]
        }
        return null
    }
)
