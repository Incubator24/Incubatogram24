import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

export function UpdateAvatarEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Load PNG or JPG image' }),
        ApiBearerAuth('JWT-auth'),
        ApiBody({
            description: 'Upload PNG or JPG image',
            type: 'multipart/form-data',
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary',
                        description: 'PNG or JPG format image',
                        example: 'image.png',
                    },
                },
            },
        }),
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
