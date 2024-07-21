import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function RegistrationEmailResendingEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: 'registration email resending',
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: {
                                email: 'ivan777@gmail.com',
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'registration email successfully resented',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'incorrect values',
        })
    )
}
