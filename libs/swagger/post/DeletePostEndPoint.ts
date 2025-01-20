import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'

export function DeletePostEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Delete post' }),
        ApiBearerAuth('JWT-auth'),
        ApiNoContentResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'Post was not found',
        }),
        ApiNotFoundResponse({
            status: HttpStatus.NOT_FOUND,
            description: 'Post was not found',
        }),
        ApiUnauthorizedResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        }),
        ApiBadRequestResponse({
            status: HttpStatus.FORBIDDEN,
            description: 'User is not owner the post',
        })
    )
}
