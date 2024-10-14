import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'

export function CreatePostEndpoint() {
    return applyDecorators(
        ApiTags('post'),
        ApiOperation({ summary: 'Create new post' }),
        ApiBearerAuth('JWT-auth'),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    photos: {
                        type: 'string',
                        format: 'binary',
                        description: 'JPEG or PNG image file',
                    },
                    description: {
                        type: 'string',
                        description: 'post description',
                    },
                    isDraft: {
                        type: 'boolean',
                        description: 'is draft flag',
                        default: false,
                    },
                },
                required: ['isDraft', 'file', 'description'],
            },
        }),
        ApiUnauthorizedResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        }),
        ApiBadRequestResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'Bad request',
        })
    )
}
