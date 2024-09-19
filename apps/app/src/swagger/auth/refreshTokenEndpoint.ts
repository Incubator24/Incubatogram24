import {
    ApiCookieAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function RefreshTokenEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary:
                'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)' +
                'Device LastActiveDate should be overrode by issued Date of new refresh token',
        }),
        ApiCookieAuth(),
        ApiResponse({
            status: HttpStatus.OK,
            description:
                'Returns JWT accessToken in body and JWT refreshToken in cookie',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
