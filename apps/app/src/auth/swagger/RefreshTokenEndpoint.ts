import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function RefreshTokenEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'refresh your token' }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'success refresh token',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'refreshToken used before or expired',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'error on refresh user',
        })
    )
}
