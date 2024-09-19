import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

export function PasswordRecoveryEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary: 'password recovery',
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: {
                                email: 'ivan777@gmail.com',
                                recaptchaValue: 'asyuiagiagigabigaigdgild',
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'password recovery was successfully send',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'incorrect values',
        })
    )
}
