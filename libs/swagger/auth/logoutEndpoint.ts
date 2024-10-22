import {
    ApiCookieAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function LogoutEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary:
                'In cookie client must send correct refreshToken that will be revoked',
        }),
        ApiCookieAuth(),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'No Content',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
