import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UrlAvatarSwagger } from './types'

export function GetAvatarEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Get avatar by userId' }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'success updated avatar',
            type: UrlAvatarSwagger,
        }),
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: 'Not Found',
        })
    )
}
