import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

export function RegistrationEmailResendingEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary: 'Resend confirmation registration Email if user exist',
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
            description:
                'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'incorrect values',
        })
    )
}
