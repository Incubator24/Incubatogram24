import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { PaginatorDto, PaginatorPostItems } from '../../helpers/types/types'

export function GetFourPostsCurrentUserPublicEndPoint() {
    return applyDecorators(
        ApiTags('public-posts'),
        ApiOperation({ summary: 'Get public four last posts' }),
        ApiExtraModels(PaginatorDto, PaginatorPostItems),
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
