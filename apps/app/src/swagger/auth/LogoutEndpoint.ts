import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function LogoutEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: 'logout user. Should send correct refresh token',
        }),
        ApiCookieAuth(),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'success logout',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'refreshToken used before or expired',
        })
    )
}
