import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function LoginEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary: 'Try login user to the system',
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: {
                                loginOrEmail: 'string',
                                password: 'string',
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description:
                'Returns JWT accessToken in body and JWT refreshToken in cookie',
            schema: { example: { accessToken: 'string' } },
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'If the inputModel has incorrect values',
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
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'If the password or login is wrong',
        })
    )
}
