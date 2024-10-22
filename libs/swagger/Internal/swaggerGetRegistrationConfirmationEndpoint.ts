import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function SwaggerGetRegistrationConfirmationEndpoint() {
    return applyDecorators(
        ApiTags('Internal'),
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
