import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
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

export function GetPostsCurrentUserPublicEndpoint() {
    return applyDecorators(
        ApiTags('public-posts'),
        ApiOperation({ summary: 'Get public posts current userId' }),
        ApiQuery({
            name: 'page',
            type: String,
            description: 'Page number',
            example: '1',
            required: false,
        }),
        ApiOkResponse({
            status: HttpStatus.OK,
            type: PostType,
            description: 'Posts was successfully found',
        }),
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
        })
    )
}
