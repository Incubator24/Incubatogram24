import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function UpdateAvatarEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'update avatar' }),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: 'success updated avatar',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'error on update avatar',
        }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary',
                        description: 'User avatar file',
                    },
                },
                required: ['file'],
            },
        })
    )
}
