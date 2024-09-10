import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function UpdateAvatarEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'update avatar' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: 'success updated avatar',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'error on update avatar',
        })
    )
}
