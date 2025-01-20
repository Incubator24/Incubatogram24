import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PostType } from '../../helpers/types/types'

export function UpdatePostEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Update post' }),
        ApiBearerAuth('JWT-auth'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        description: 'new post description',
                    },
                },
                required: ['description'],
            },
        }),
        ApiNoContentResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'Post was updated successfully',
        }),
        ApiUnauthorizedResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        }),
        ApiBadRequestResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'Bad request',
        }),
        ApiForbiddenResponse({
            status: HttpStatus.FORBIDDEN,
            description: 'User is not post owner',
        })
    )
}
