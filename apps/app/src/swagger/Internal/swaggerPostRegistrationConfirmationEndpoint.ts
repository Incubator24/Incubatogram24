import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function SwaggerPostRegistrationConfirmationEndpoint() {
    return applyDecorators(
        ApiTags('Internal'),
        ApiOperation({
            summary: 'Confirm registration',
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
            description: 'Email was verified. Account was activated',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description:
                'If the confirmation code is incorrect, expired or already been applied',
            schema: {
                example: {
                    errorsMessages: [
                        {
                            message: 'string',
                            field: 'string',
                        },
                    ],
                },
            },
        })
    )
}
