import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { PaginatorDto, PostType } from '../../helpers/types/types'

export function GetPostsEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Get posts' }),
        ApiQuery({
            name: 'userId', // Обязательно укажите имена параметров
            type: String,
            description: 'User ID',
            example: '1',
        }),
        ApiQuery({
            name: 'page',
            type: String,
            description: 'Page number',
            example: '1',
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
                            pagesCount: {
                                type: 'number',
                            },
                            page: {
                                type: 'number',
                            },
                            items: {
                                type: 'array',
                                items: { $ref: getSchemaPath(PostType) },
                            },
                        },
                    },
                ],
            },
        })
    )
}
