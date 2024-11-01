import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PostType } from '../../helpers/types/types'

export function GetPostEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Get post' }),
        ApiOkResponse({
            status: HttpStatus.OK,
            type: PostType,
            description: 'Post was successfully found',
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
            status: HttpStatus.BAD_REQUEST,
            description: 'Bad request',
        })
    )
}
