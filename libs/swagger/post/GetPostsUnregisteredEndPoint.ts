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

export function GetPostsUnregisteredEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Get public posts' }),
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
