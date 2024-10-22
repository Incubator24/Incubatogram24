import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { applyDecorators } from '@nestjs/common'

export function SwaggerDefaultEndpoint() {
    return applyDecorators(
        ApiTags('default'),
        ApiOperation({
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: 'Hello World!',
                        },
                    },
                },
            },
        })
    )
}
