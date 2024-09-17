import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function RegistrationConfirmationEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: 'registration confirmation',
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: {
                                code: 'string',
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'registration confirmation',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'code is invalid, incorrect or expired',
        })
    )
}
