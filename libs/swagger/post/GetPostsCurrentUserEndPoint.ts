import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger'
import {
    PaginatorDto,
    PaginatorPostItems,
    PostType,
} from '../../helpers/types/types'

export function GetPostsCurrentUserEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Get posts current userId' }),
        ApiBearerAuth('JWT-auth'),
        ApiQuery({
            name: 'page',
            type: String,
            description: 'Page number',
            example: '1',
            required: false,
        }),
        ApiExtraModels(PaginatorDto, PostType),
        ApiOkResponse({
            status: HttpStatus.OK,
            description: 'Posts were successfully found',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatorDto) },
                    {
                        properties: {
                            items: {
                                type: 'array',
                                items: {
                                    $ref: getSchemaPath(PaginatorPostItems),
                                },
                            },
                        },
                    },
                ],
            },
        }),
        ApiUnauthorizedResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
