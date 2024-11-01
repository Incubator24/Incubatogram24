import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiPropertyOptional,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { PaginatorDtoWithCountUsers, PostType } from '../../helpers/types/types'

export function GetPostsUnregisteredEndpoint() {
    return applyDecorators(
        ApiTags('posts'),
        ApiOperation({ summary: 'Get public posts' }),
        ApiPropertyOptional({
            name: 'page',
            type: String,
            description: 'Page number',
            example: '1',
        }),
        ApiExtraModels(PaginatorDtoWithCountUsers, PostType),
        ApiOkResponse({
            status: HttpStatus.OK,
            description: 'Posts were successfully found',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatorDtoWithCountUsers) },
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
